import Bottleneck from 'bottleneck';
import { Configuration, OpenAIApi } from 'openai';


export const limiterOpenai = new Bottleneck({
  maxConcurrent: 1,
  minTime: 50
});


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default openai;