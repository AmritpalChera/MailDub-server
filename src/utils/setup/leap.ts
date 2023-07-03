// Axios instance with mindplug auth
import axios from 'axios';

const leap = axios.create({
    baseURL: "https://api.tryleap.ai/api/v1/images/models/eab32df0-de26-4b83-a908-a83f3015e971",
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: 'Bearer de79eece-fe59-4342-8800-ee0a2045b9c7'
    },
});

 export default leap; 