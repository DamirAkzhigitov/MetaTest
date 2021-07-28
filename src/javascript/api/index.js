import axios from "axios";

export const getListOfCharacters = () => {
  return axios.get('https://www.breakingbadapi.com/api/characters').then((response) => {
    return response.data
  }).catch((e) => {
    console.error(e)
  })
}
