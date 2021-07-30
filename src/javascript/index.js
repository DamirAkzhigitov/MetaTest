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
} from './utils'

const checkActiveState = () => {
  const filters = getFromLocalStorage('filterStorage')
  const array = []

  if (Array.isArray(filters)) {
    filters.forEach((filter) => {
      const selector = `season-${filter.value}`

      const button = document.querySelector(`[data-action="${selector}"]`)

      if (button) button.classList.add('button_selected')
    })
  }
}

const clearStatusesOptions = () => {
  const select = document.querySelector('[data-action=status]')

  select.querySelectorAll('option').forEach((option) => {
    if (option.value !== 'All') option.remove()
  })
}

const disableFilterItem = (filterItem) => {
  let tempFilterStorage = getFromLocalStorage('filterStorage')
  // console.log('filterItem = ', filterItem)
  // console.log('tempFilterStorage = ', tempFilterStorage)

  tempFilterStorage = tempFilterStorage.filter((filter) => {
    return !(
      filter.value === filterItem.value && filter.field === filterItem.field
    )
  })

  // console.log('after remove = ', tempFilterStorage)

  return tempFilterStorage
}

const init = async () => {
  const main = document.querySelector('.characters__list')
  const select = document.querySelector('[data-action=status]')
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

  Array.from(statusList).forEach((status) => {
    select.insertAdjacentHTML('beforeend', optionChild(status))
  })

  checkActiveState()

  const getStatuses = () => {
    const tempSet = new Set()

    list.forEach((item) => {
      tempSet.add(item.status)
    })

    if (areSetsEqual(statusList, tempSet) || tempSet.size < statusList.size) {
      return
    }

    clearStatusesOptions()

    statusList = tempSet

    Array.from(statusList).forEach((status) => {
      select.insertAdjacentHTML('beforeend', optionChild(status))
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
    if (window.scrollY % 25) {
      return
    }
    if (
      window.scrollY + main.getBoundingClientRect().height + 100 >=
      main.scrollHeight
    ) {
      console.log('scrolled to bottom')

      getListAfterScroll()
    }
  }

  const getListAfterScroll = throttle(() => {
    offset += 10

    getListAndRenderIt()
  }, 1000)

  window.addEventListener('scroll', scrollHandler, true)

  seasonButtons.forEach((button) => {
    const season = button.getAttribute('data-action').split('-')[1]

    button.addEventListener('click', async () => {
      if (button.classList.contains('button_selected')) {
        limit = 10
        offset = 0

        // console.log('call disableFilterItem')

        filterStorage = disableFilterItem({
          field: 'appearance',
          value: Number(season),
        })
        // console.log('call disableFilterItem, after = ', filterStorage)

        setToLocalStorage('filterStorage', filterStorage)
      } else {
        limit = 70
        offset = 0

        filterStorage.push({
          field: 'appearance',
          value: Number(season),
          isArray: true,
          active: true,
        })
        // console.log('seasonButtons setToLocalStorage =  ', filterStorage)
        setToLocalStorage('filterStorage', filterStorage)
      }
      setCurrentBtnActive(button)

      main.innerHTML = ''

      await getListAndRenderIt()
    })
  })

  searchButton.addEventListener('click', async () => {
    if (selectedStatus === statusSelector.value) {
      return
    }

    selectedStatus = statusSelector.value

    if (!selectedStatus) {
      return
    }

    if (typeof selectedStatus === 'string' && selectedStatus === 'All') {
      filterStorage = disableFilterItem({
        field: 'status',
        value: selectedStatus,
      })
      // console.log('searchButton setToLocalStorage =  ', filterStorage)

      setToLocalStorage('filterStorage', filterStorage)

      limit = 10
      offset = 0
    } else {
      limit = 70
      offset = 0

      filterStorage.push({
        field: 'status',
        value: selectedStatus,
        isArray: false,
        active: true,
      })

      setToLocalStorage('filterStorage', filterStorage)
    }

    main.innerHTML = ''

    await getListAndRenderIt()
  })
}

init()
