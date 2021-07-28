import "../scss/styles.scss";
import { getListOfCharacters } from "./api";
import throttle from "./utils/throttle";

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

const init = () => {
  let list = [];
  let cachedList = [];
  let limit = 10;
  let offset = 0;

  const main = document.querySelector(".characters__list");

  const scrollHandler = () => {
    if (
      main.scrollTop + main.getBoundingClientRect().height >=
      main.scrollHeight
    ) {
      offset += 10;

      getListAfterScroll();
    }
  };

  const getList = async () => {
    list = [];
    cachedList = [];

    try {
      list = await getListOfCharacters({
        limit,
        offset,
      });

      if (Array.isArray(list) && !list.length) {
        main.removeEventListener("scroll", scrollHandler);

        return;
      }

      list.forEach((item) => {
        createCharacterItem(item);
      });
    } catch (e) {
      console.log("error = ", e);
    }
  };

  const getListAfterScroll = throttle(getList, 1000);

  main.addEventListener("scroll", scrollHandler, true);

  getList();

  const filterData = (season) => {
    list = cachedList.filter((item) => item.appearance == season);

    main.innerHTML = "";

    list.forEach((item) => {
      createCharacterItem(item);
    });
  };

  const seasonButtons = document.querySelectorAll('[data-action*="season"]');

  console.log("seasonButtons = ", seasonButtons);

  seasonButtons.forEach((button) => {
    const season = button.getAttribute("data-action").split("-")[1];

    button.addEventListener("click", () => {
      console.log("click ", Number(season));
      filterData(Number(season));
    });
  });
};

init();
