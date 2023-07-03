// Axios instance with mindplug auth
import axios from 'axios';

const lexica = axios.create({
    baseURL: "https://lexica.art/api/infinite-prompts",
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
});

 export default lexica; 