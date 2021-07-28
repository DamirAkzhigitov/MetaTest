import '../scss/styles.scss'
import { getListOfCharacters } from "./api";


const createCharacterItem = (data) => {
  const list = document.querySelector('.characters__list')

  const layout = `
<li class="characters__item">
  <div class="characters__item-title">
  ${data.name}
  </div>
  <div class="characters__item-avatar-container">
    <div class="characters__item-avatar" style="background-image: url('${data.img}')"></div>
  </div>
  <div class="characters__item-description">
    <div class="description">
      <span class="description-name">Nickname:</span>
      <span class="description-value">${data.nickanme}</span>
    </div>
    <div class="description">
      <span class="description-name">Portrayed:</span>
      <span class="description-value">Bryan Cranston</span>
    </div>
    <div class="description">
      <span class="description-name">Status:</span>
      <span class="description-value">Presumed dead</span>
    </div>
    <div class="description">
      <span class="description-name">Occupation:</span>
      <span class="description-value">High School Chemistry Teacher, Meth King Pin</span>
    </div>
    <div class="description">
      <span class="description-name">Appearance:</span>
      <span class="description-value">1, 2, 3, 4, 5</span>
    </div>
  </div>
</li>
  `

  list.insertAdjacentHTML('beforeend', layout)


}

const init = () => {
  const list = []

  const getList = async () => {
    const response = await getListOfCharacters()

    list.push(...response)

    list.forEach((item) => {
      createCharacterItem(item)
    })
  }

  getList()
}

init()
