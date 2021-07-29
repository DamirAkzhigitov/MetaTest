import "../scss/styles.scss";
import { getListOfCharacters } from "./api";
import throttle from "./utils/throttle";

const getList = async (limit, offset) => {
  const list = []
  try {
    list.push(...await getListOfCharacters({
      limit,
      offset,
    }));
  } catch (e) {
    console.log("error = ", e);
  }
  return list
};

const clearLocalStorageField = (key) => {
  if (!key) return

  localStorage.removeItem(key)
}

const setToLocalStorage = (key, data) => {
  if (!data || !key) {
    return
  }

  const value = typeof data === "object" ? JSON.stringify(data) : data

  localStorage.setItem(key, value)
}

const getFromLocalStorage = (key) => {
  const item = localStorage.getItem(key)

  if (item) {
    let result = null
    try {
      result = JSON.parse(item)
    } catch (e) {
      console.error(e)
    }
    return result
  }
  return null
}

const checkActiveState = () => {
  const filter = getFromLocalStorage('filter')

  if (filter && filter.active) {
    const selector = `season-${filter.value}`

    const button = document.querySelector(`[data-action="${selector}"]`)

    if (button) button.classList.add('button_selected')
  }
}

const createCharacterItem = (data) => {
  const list = document.querySelector(".characters__list");

  const createDescriptionBlock = (block) => {
    return `<div class="description">
      <span class="description-name">${block.name}:</span>
      <span class="description-value">${block.value}</span>
    </div>`;
  };

  const desciriptions = [
    "Nickname",
    "Portrayed",
    "Status",
    "Occupation",
    "Appearance",
  ];

  let descriptionsLayout = "";

  desciriptions.forEach((description) => {
    const key = description.toLowerCase();

    if (data[key]) {
      descriptionsLayout += createDescriptionBlock({
        name: description,
        value: data[key],
      });
    }
  });

  const layout = `
    <li class="characters__item">
      <div class="characters__item-title">
        ${data.name}
      </div>
      <div class="characters__item-avatar-container">
        <div class="characters__item-avatar" style="background-image: url('${data.img}')"></div>
      </div>
      <div class="characters__item-description">    
        ${descriptionsLayout}
      </div>
    </li>
  `;

  list.insertAdjacentHTML("beforeend", layout);
};

const optionChild = (value) => {
  return `<option value="${value}">${value}</option>`
}

const areSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));

const init = async () => {
  const main = document.querySelector(".characters__list");
  const select = document.querySelector('[data-action=status]')

  const cachedStatusList = getFromLocalStorage('statusList')
  let currentFilter = getFromLocalStorage('filter')
  let list = [];
  let limit = 10;
  let offset = 0;
  let statusList = cachedStatusList ? new Set([...cachedStatusList]) : new Set()

  Array.from(statusList).forEach((status) => {
    select.insertAdjacentHTML('beforeend', optionChild(status))
  })

  console.log('statusList) = ', statusList);
  statusList.add('All')

  checkActiveState()

  const getStatuses = () => {
    const tempSet = new Set()
    tempSet.add('All')


    list.forEach((item) => {
      tempSet.add(item.status)
    })

    if (areSetsEqual(statusList, tempSet) || tempSet.size < statusList.size) {
      return
    }

    select.innerHTML = ''

    statusList = tempSet

    Array.from(statusList).forEach((status) => {
      select.insertAdjacentHTML('beforeend', optionChild(status))
    })

    setToLocalStorage('statusList', Array.from(statusList))


    console.log(select);

    console.log('st = ', );
  }

  const getListAndRenderIt = async () => {
    currentFilter = getFromLocalStorage('filter')

    const response = await getList(limit, offset)
    let filtredData = []

    console.log('currentFilter = ', currentFilter);

    console.log('response = ', response);

    if (currentFilter && currentFilter.active) {
      if (currentFilter.isArray) {
        filtredData = response.filter((item) => {
          return item[currentFilter.field].find((id) =>  {
            return currentFilter.value === id
          })
        })
      } else {
        console.log('else filter');

        filtredData = response.filter((item) => {
          const regExp = new RegExp(currentFilter.value)

          console.log('response item status = ', item.status);

          const result = regExp.exec(item[currentFilter.field])

          console.log('check regexp = ', currentFilter.value, ', result = ', result)

          return result
        })
      }
    } else {
      filtredData = response
    }
    list.push(...filtredData)

    filtredData.forEach((item) => {
      createCharacterItem(item);
    });

    getStatuses()
  }

  await getListAndRenderIt()

  const scrollHandler = () => {
    if (window.scrollY % 25) {
      return
    }
    if (
        window.scrollY + main.getBoundingClientRect().height >=
      main.scrollHeight
    ) {
      console.log('scrolled to bottom');

      getListAfterScroll();
    }
  }

  const getListAfterScroll = throttle(() =>{
    offset += 10;

    getListAndRenderIt()
  }, 1000);

  window.addEventListener("scroll", scrollHandler, true);

  const seasonButtons = document.querySelectorAll('[data-action*="season"]');

  const setCurrentBtnActive = (currentButton, buttons) => {
    if (currentButton.classList.contains('button_selected')) {
      currentButton.classList.remove('button_selected')

      return
    }

    buttons.forEach((button) => {
      if (button.classList.contains('button_selected')) {
        button.classList.remove('button_selected')
      }
    })

    currentButton.classList.add('button_selected')
  }

  seasonButtons.forEach((button) => {
    const season = button.getAttribute("data-action").split("-")[1];

    button.addEventListener("click", async () => {
      if (button.classList.contains('button_selected')) {

        limit = 10
        offset = 0

        clearLocalStorageField('filter')
      } else {

        limit = 70
        offset = 0

        setToLocalStorage('filter', {
          field: 'appearance',
          value: Number(season),
          isArray: true,
          active: true,
        })
      }
      setCurrentBtnActive(button, seasonButtons)

      main.innerHTML = "";

      await getListAndRenderIt()
    });
  });

  const searchButton = document.querySelector('[data-action="search"]')
  const statusSelector = document.querySelector('[data-action="status"]')
  let selectedStatus = ''

  // statusSelector.addEventListener('change', ({target }) => {
  //   console.log('selectedStatus = ', target.value);
  //   selectedStatus = target.value
  // })

  searchButton.addEventListener('click', async () => {
    console.log('selectedStatus = ', selectedStatus, ' === ', statusSelector.value);
    if (selectedStatus === statusSelector.value) {
      return
    }

    selectedStatus = statusSelector.value

    if (!selectedStatus) {
      return
    }

    if (typeof selectedStatus === "string" && selectedStatus === 'All') {
      clearLocalStorageField('filter')
      limit = 10
      offset = 0

    } else {

      limit = 70
      offset = 0

      const filter = {
        field: 'status',
        value: selectedStatus,
        isArray: false,
        active: true,
      }
      setToLocalStorage('filter', filter)
    }

    main.innerHTML = "";

    await getListAndRenderIt()
  })
};

init();
