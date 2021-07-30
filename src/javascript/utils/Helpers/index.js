export const areSetsEqual = (a, b) =>
  a.size === b.size && [...a].every((value) => b.has(value))

export const setCurrentBtnActive = (currentButton) => {
  currentButton.classList.toggle('button_selected')
}

export const optionChild = (value) => {
  return `<option value="${value}">${value}</option>`
}
