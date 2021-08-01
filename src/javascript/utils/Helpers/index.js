import { getFromLocalStorage, setToLocalStorage } from '../LocalStorage'

export const clearStatusesOptions = (selectListElement) => {
  if (!selectListElement) {
    return
  }

  selectListElement.querySelectorAll('option').forEach((option) => {
    if (option.value !== 'all') option.remove()
  })
}

export const areSetsEqual = (a, b) =>
  a.size === b.size && [...a].every((value) => b.has(value))

export const toggleBtn = (currentButton) => {
  currentButton.classList.toggle('button_selected')
}

export const optionChild = (value) => {
  return `<option value="${value}">${value}</option>`
}

export const scrollHandler = (cb) => {
  // throttling
  if (Number(window.scrollY.toFixed(0)) % 10) {
    return
  }
  const result =
    window.scrollY + document.body.getBoundingClientRect().height + 260
  const docScrollHeight = document.body.scrollHeight
  if (result >= docScrollHeight) cb()
}

export const updateStatuses = (list, statusListElement, statusList) => {
  let tempSet = new Set()

  list.forEach((item) => {
    tempSet.add(item.status)
  })

  if (areSetsEqual(statusList, tempSet) || tempSet.size < statusList.size) {
    return
  }

  clearStatusesOptions(statusListElement)

  Array.from(tempSet).forEach((status) => {
    statusListElement.insertAdjacentHTML('beforeend', optionChild(status))
  })

  setToLocalStorage('statusList', Array.from(tempSet))
}

export const checkActiveState = (statusList, currentState) => {
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
        const options = document.querySelectorAll(
          '[data-action="status"] > option'
        )
        options.forEach((option) => {
          const optionValue = option.value.toLowerCase()
          const filterValue = filter.value.toLowerCase()

          if (optionValue === filterValue) option.selected = true
        })
      }
    })
  }
}
