export const getListOfCharactersInSeasons = (list) => {
  const charactersInSeasons = {}
  const result = []

  list.forEach((character) => {
    if (character.appearance) {
      character.appearance.forEach((season) => {
        if (charactersInSeasons[season - 1]) {
          charactersInSeasons[season - 1] += 1
        } else {
          charactersInSeasons[season - 1] = 1
        }
      })
    }
  })

  for (const [key, value] of Object.entries(charactersInSeasons)) {
    result.push([Number(key), value])
  }

  return result
}
