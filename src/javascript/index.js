import '../scss/styles.scss'

import {
  throttle,
  areSetsEqual,
  getFromLocalStorage,
  setToLocalStorage,
  getList,
  getFiltredData,
  setCurrentBtnActive,
  createCharacterItem,
  optionChild
} from './utils'

const checkActiveState = (statusList, currentState) => {
  Array.from(statusList).forEach((status) => {
    currentState.insertAdjacentHTML('beforeend', optionChild(status))
  })
  const filters = getFromLocalStorage('filterStorage')

  if (Array.isArray(filters)) {
    filters.forEach((filter) => {
      if (filter.field === 'appearance') {
        const selector = `season-${filter.value}`
        const button = document.querySelector(`[data-action="${selector}"]`)

        if (button) button.classList.add('button_selected')
      }
      if (filter.field === 'status') {
        const options = document.querySelectorAll('[data-action="status"] > option')
        options.forEach((option) => {
          const optionValue = option.value.toLowerCase()
          const filterValue = filter.value.toLowerCase()

          if (optionValue === filterValue) option.selected = true
        })
      }

    })
  }
}

const clearStatusesOptions = (selectListElement) => {
  if (!selectListElement) {
    return
  }
  selectListElement.querySelectorAll('option').forEach((option) => {
    if (option.value !== 'All') option.remove()
  })
}

const disableFilterItem = (filterItem) => {
  let tempFilterStorage = getFromLocalStorage('filterStorage')

  tempFilterStorage = tempFilterStorage.filter((filter) => {
    return !(
      filter.value === filterItem.value && filter.field === filterItem.field
    )
  })

  return tempFilterStorage
}

const init = async () => {
  const main = document.querySelector('.characters__list')
  const selectListElement = document.querySelector('[data-action=status]')
  const searchButton = document.querySelector('[data-action="search"]')
  const statusSelector = document.querySelector('[data-action="status"]')
  const seasonButtons = document.querySelectorAll('[data-action*="season"]')

  const cachedStatusList = getFromLocalStorage('statusList')

  let filterStorage = getFromLocalStorage('filterStorage') || []

  let list = []
  let limit = 10
  let offset = 0
  let statusList = cachedStatusList ? new Set([...cachedStatusList]) : new Set()
  let selectedStatus = ''

  const getStatuses = () => {
    const tempSet = new Set()

    list.forEach((item) => {
      tempSet.add(item.status)
    })

    if (areSetsEqual(statusList, tempSet) || tempSet.size < statusList.size) {
      return
    }

    clearStatusesOptions(selectListElement)

    statusList = tempSet

    Array.from(statusList).forEach((status) => {
      selectListElement.insertAdjacentHTML('beforeend', optionChild(status))
    })
    const array = Array.from(statusList)

    // console.log('array = ', array)
    setToLocalStorage('statusList', array)
  }

  const getListAndRenderIt = async () => {
    filterStorage = getFromLocalStorage('filterStorage') || []

    const response = await getList(limit, offset)

    let filtredData = []

    if (!filterStorage || (filterStorage && !filterStorage.length)) {
      filtredData = response
    } else {
      filtredData = getFiltredData(response, filterStorage)
    }

    list.push(...filtredData)

    filtredData.forEach((item) => {
      createCharacterItem(item)
    })

    getStatuses()
  }

  await getListAndRenderIt()

  const scrollHandler = () => {
    // throttling
    if (Number(window.scrollY.toFixed(0)) % 10) {
      return
    }
    const result = window.scrollY + document.body.getBoundingClientRect().height + 260
    const docScrollHeight = document.body.scrollHeight

    if (result >= docScrollHeight) getListAfterScroll()
  }

  const getListAfterScroll = throttle(() => {
    offset += 10

    getListAndRenderIt()
  }, 500)

  const setItemToFilters = (filter) => {
    if (typeof filter !== 'object') {
      return
    }

    if (filter.field === 'status') {
      filterStorage = filterStorage.filter((item) => {
        return item.field !== 'status'
      })
    }

    filterStorage.push(filter)

    setToLocalStorage('filterStorage', filterStorage)
  }

  const searchButtonHandler = async () => {
    if (selectedStatus === statusSelector.value) {
      return
    }

    selectedStatus = statusSelector.value

    if (!selectedStatus) {
      return
    }

    if (typeof selectedStatus === 'string' && selectedStatus.toLowerCase() === 'all') {
      filterStorage = disableFilterItem({
        field: 'status',
        value: selectedStatus,
      })
      // console.log('searchButton setToLocalStorage =  ', filterStorage)

      setToLocalStorage('filterStorage', filterStorage)

      limit = 10
      offset = 0
    } else {

      limit = 10
      offset = 0

      setItemToFilters({
        field: 'status',
        value: selectedStatus,
        isArray: false,
        active: true,
      })
    }

    main.innerHTML = ''

    await getListAndRenderIt()
  }
  const seasonButtonHandler = async ({ target }) => {
    const season = target.getAttribute('data-action').split('-')[1]

    if (target.classList.contains('button_selected')) {
      limit = 10
      offset = 0

      filterStorage = disableFilterItem({
        field: 'appearance',
        value: Number(season),
      })

      setToLocalStorage('filterStorage', filterStorage)
    } else {
      limit = 10
      offset = 0

      setItemToFilters({
        field: 'appearance',
        value: Number(season),
        isArray: true,
        active: true,
      })
    }
    setCurrentBtnActive(target)

    main.innerHTML = ''

    await getListAndRenderIt()
  }

  checkActiveState(statusList, selectListElement)

  window.addEventListener('scroll', scrollHandler, true)
  searchButton.addEventListener('click', searchButtonHandler)
  seasonButtons.forEach((button) => button.addEventListener('click', seasonButtonHandler))
}

init()
