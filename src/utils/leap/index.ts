import axios from "axios";
import { wait } from "../misc";
import leap from "../setup/leap"
import lexica from "../setup/lexica";


export const leapGenerate = async (description: string) => {
  const data = await leap.post('/inferences', {
    prompt: description,
    negativePrompt: 'asymmetric, watermarks, logos, words, hashtags',
    steps: 30,
    width: 1024,
    height: 1024,
    numberOfImages: 1,
    promptStrength: 17,
    seed: 4523184,
    enhancePrompt: true,
    upscaleBy: 'x1',
    sampler: 'ddim'
  }).then(res => res.data);
  return data;
};

const lexicaGet = async(description: string) => {
  const data = await lexica.post('', {
    "text": description,
    "searchMode": "images",
    "source": "search",
    "cursor": null,
    "model": "lexica-aperture-v2"
  }).then(res => res.data);
  if (!data?.prompts || !data.prompts[0]) throw 'Could not get images';
  const imageId = data.prompts[0].images[0].id;
  return {
    images: [{
      uri: `https://image.lexica.art/full_jpg/${imageId}`
    }]
  }
  
};

export const leapGet = async (description: string, interfaceId: string, tryNumber?: number) => {
  // let data1 = await lexicaGet(description);
  // return data1;
  if (tryNumber && tryNumber > 2) {
    let data = await lexicaGet(description);
    return data;
  }
  let data = await leap.get(`/inferences/${interfaceId}`).then(res => res.data);
  if (data.state != 'finished') {
    await wait(9000);
    console.log('fetching again')
    if (tryNumber) tryNumber += 1;
    else tryNumber = 1;
    data = await leapGet(description, interfaceId, tryNumber);
  }
  if (!data || !data.images) throw 'Could not get image';
  return data;
};