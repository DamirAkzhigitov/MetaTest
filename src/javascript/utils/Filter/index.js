import { setToLocalStorage } from '../LocalStorage'

export const setItemToFilters = (filterStorage, filterItem) => {
  let tempFilterStorage = filterStorage

  if (typeof filterItem !== 'object') {
    return
  }

  if (filterItem.field === 'status') {
    tempFilterStorage = tempFilterStorage.filter((item) => {
      return item.field !== 'status'
    })
  }
  if (filterItem.value !== 'all') {
    const isAlreadyActive = tempFilterStorage.find((filter) => {
      return (
        filter.value === filterItem.value && filter.field === filterItem.field
      )
    })

    tempFilterStorage = tempFilterStorage.filter((filter) => {
      return !(
        filter.value === filterItem.value && filter.field === filterItem.field
      )
    })

    if (!isAlreadyActive) tempFilterStorage.push(filterItem)
  }

  setToLocalStorage('filterStorage', tempFilterStorage)
}
