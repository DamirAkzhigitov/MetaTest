export const getListOfCharactersInSeasons = (list) => {
  const charactersInSeasons = {}
  const result = []

  list.forEach((character) => {
    if (character.appearance) {
      character.appearance.forEach((season) => {
        if (charactersInSeasons[season]) {
          charactersInSeasons[season] += 1
        } else {
          charactersInSeasons[season] = 1
        }
      })
    }
  })

  console.log(charactersInSeasons)

  for (const [key, value] of Object.entries(charactersInSeasons)) {
    result.push([key, value])
  }
  console.log('result = ', result)

  return result
}
