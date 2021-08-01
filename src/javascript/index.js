import '../scss/styles.scss'
import chart from './chart'
import {
  throttle,
  getFromLocalStorage,
  updateStatuses,
  getList,
  getFiltredData,
  toggleBtn,
  createCharacterItem,
  setItemToFilters,
  checkActiveState,
  scrollHandler,
} from './utils'
import { getListOfCharactersInSeasons } from './espisodes'

const SELECTORS = {
  CHARACTERS_LIST: '.characters__list',
  STATUS_LIST: '[data-action=status]',
  SEARCH_BUTTON: '[data-action="search"]',
  SEASON_BUTTONS: '[data-action*="season"]',
}

const init = async () => {
  const main = document.querySelector(SELECTORS.CHARACTERS_LIST)
  const selectListElement = document.querySelector(SELECTORS.STATUS_LIST)
  const searchButton = document.querySelector(SELECTORS.SEARCH_BUTTON)
  const seasonButtons = document.querySelectorAll(SELECTORS.SEASON_BUTTONS)

  const cachedStatusList = getFromLocalStorage('statusList')
  const getFilterStorage = () => getFromLocalStorage('filterStorage') || []

  let list = []
  let limit = 10
  let offset = 0
  let getStatusList = () =>
    cachedStatusList ? new Set([...cachedStatusList]) : new Set()

  let selectedStatus = ''

  const resetData = async () => {
    limit = 10
    offset = 0

    list = []
    main.innerHTML = ''
    await getListAndRenderIt()
  }

  const getListAndRenderIt = async () => {
    let response = null
    // get filter from local storage
    const filterStorage = getFilterStorage()
    // requesting a list of characters
    try {
      response = await getList(limit, offset)
    } catch (e) {
      console.error(e)
    }
    // guard expression if response not array
    if (!response || !Array.isArray(response)) {
      return
    }

    let filteredData = []

    if (!filterStorage || (filterStorage && !filterStorage.length)) {
      // filter is empty
      filteredData = response
    } else {
      filteredData = getFiltredData(response, filterStorage)
    }

    list.push(...filteredData)

    // render characters cards
    filteredData.forEach((item) => {
      createCharacterItem(item)
    })

    const charactersSeasonCount = getListOfCharactersInSeasons(list)

    chart(document.querySelector('.canvas'), charactersSeasonCount)

    updateStatuses(list, selectListElement, getStatusList())

    offset += 10
  }

  const getListAfterScroll = throttle(() => {
    getListAndRenderIt()
  }, 500)

  const searchButtonHandler = async () => {
    if (!selectListElement.value) {
      return
    }
    if (selectedStatus === selectListElement.value) {
      return
    }

    selectedStatus = selectListElement.value

    setItemToFilters(getFilterStorage(), {
      field: 'status',
      value: selectedStatus,
      isArray: false,
      active: true,
    })

    await resetData()
  }
  const seasonButtonHandler = async ({ target }) => {
    const season = target.getAttribute('data-action').split('-')[1]
    toggleBtn(target)

    setItemToFilters(getFilterStorage(), {
      field: 'appearance',
      value: Number(season),
      isArray: true,
      active: true,
    })

    await resetData()
  }

  window.addEventListener(
    'scroll',
    () => {
      scrollHandler(() => {
        getListAfterScroll()
      })
    },
    true
  )

  searchButton.addEventListener('click', searchButtonHandler)
  seasonButtons.forEach((button) =>
    button.addEventListener('click', seasonButtonHandler)
  )
  await getListAndRenderIt()

  checkActiveState(getStatusList(), selectListElement)
}

init()
