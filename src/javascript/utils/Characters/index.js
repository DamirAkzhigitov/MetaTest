import { getListOfCharacters } from '../../api'

export const getList = async (limit, offset) => {
  const list = []
  try {
    list.push(
      ...(await getListOfCharacters({
        limit,
        offset,
      }))
    )
  } catch (e) {
    console.log('error = ', e)
  }
  return list
}

export const getFiltredData = (rawData, filters) => {
  let filtredData = rawData

  filters.forEach((filter) => {
    if (filter.isArray) {
      filtredData = filtredData.filter((item) => {
        return item[filter.field].find((id) => {
          return filter.value === id
        })
      })
    } else {
      filtredData = filtredData.filter((item) => {
        const regExp = new RegExp(filter.value)
        return regExp.exec(item[filter.field])
      })
    }
  })

  return filtredData
}

export const createCharacterItem = (data) => {
  const list = document.querySelector('.characters__list')

  const createDescriptionBlock = (block) => {
    return `<div class="description">
      <span class="description-name">${block.name}:</span>
      <span class="description-value">${block.value}</span>
    </div>`
  }

  const desciriptions = [
    'Nickname',
    'Portrayed',
    'Status',
    'Occupation',
    'Appearance',
  ]

  let descriptionsLayout = ''

  desciriptions.forEach((description) => {
    const key = description.toLowerCase()

    if (data[key]) {
      descriptionsLayout += createDescriptionBlock({
        name: description,
        value: data[key],
      })
    }
  })

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
  `

  list.insertAdjacentHTML('beforeend', layout)
}
