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

const setFilter = (filterData) => {
  localStorage.setItem('filter', JSON.stringify({...filterData}))
}

const checkFilter = () => {
  const filter = localStorage.getItem('filter')

  if (filter) {
    let result = null
    try {
      result = JSON.parse(filter)
    } catch (e) {
      console.error(e)
    }
    return result
  }
  return null
}

const checkActiveState = () => {
  const filter = checkFilter()

  if (filter && filter.active) {
    const selector = `season-${filter.value}`

    const button = document.querySelector(`[data-action="${selector}"]`)

    button.classList.add('button_selected')
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

const init = async () => {
  const main = document.querySelector(".characters__list");

  let currentFilter = checkFilter()
  let list = [];
  let limit = 10;
  let offset = 0;

  checkActiveState()

  const getStatuses = () => {
    const select = document.querySelector('[data-action=status]')

    select.innerHTML = ''

    const statusList = new Set()

    list.forEach((item) => {
      statusList.add(item.status)
    })


    Array.from(statusList).forEach((status) => {
      select.insertAdjacentHTML('beforeend', optionChild(status))
    })
    console.log(select);

    console.log('st = ', );
  }

  const getListAndRenderIt = async () => {
    const response = await getList(limit, offset)
    let filtredData = []

    currentFilter = checkFilter()

    if (currentFilter && currentFilter.active) {
      if (currentFilter.isArray) {
        filtredData = response.filter((item) => {
          return item[currentFilter.field].find((id) =>  {
            return currentFilter.value === id
          })
        })
      } else {
        filtredData = response.filter((item) => {
          const regExp = new RegExp(currentFilter.value)

          return regExp.exec(item[currentFilter.field])
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
    if (
      main.scrollTop + main.getBoundingClientRect().height >=
      main.scrollHeight
    ) {
      offset += 10;

      getListAfterScroll();
    }
  }

  const getListAfterScroll = throttle(getListAndRenderIt, 1000);

  main.addEventListener("scroll", scrollHandler, true);

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
        setFilter(null)
      } else {
        setFilter({
          field: 'appearance',
          value: Number(season),
          isArray: true,
          active: true
        })
      }
      setCurrentBtnActive(button, seasonButtons)

      main.innerHTML = "";
      offset = 0

      await getListAndRenderIt()
    });
  });
};

init();
