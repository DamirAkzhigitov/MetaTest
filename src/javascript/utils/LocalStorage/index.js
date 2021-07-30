export const setToLocalStorage = (key, data) => {
  if (!data || !key) {
    return
  }
  // console.log('before convert to local = ', data)

  const value = typeof data === 'object' ? JSON.stringify(data) : data

  // console.log('value ready to set in local = ', value)

  localStorage.setItem(key, value)
}

export const getFromLocalStorage = (key) => {
  const item = localStorage.getItem(key)

  if (item) {
    let result = null

    // console.log('item before pars = ', item)
    try {
      result = JSON.parse(item)
    } catch (e) {
      console.error(e)
    }
    return result
  }
  return null
}
