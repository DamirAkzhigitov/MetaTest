import axios from 'axios'

const API = 'https://www.breakingbadapi.com/api'

export const getListOfCharacters = ({ limit, offset }) => {
  return axios
    .get(`${API}/characters?limit=${limit}&offset=${offset}`)
    .then((response) => {
      return response.data
    })
    .catch((e) => {
      console.error(e)
    })
}
