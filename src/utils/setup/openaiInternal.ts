import Bottleneck from 'bottleneck';
import { Configuration, OpenAIApi } from 'openai';


export const limiterOpenaiInt = new Bottleneck({
  maxConcurrent: 1,
  minTime: 600
});


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY_INTERNAL,
});

const openaiInternal = new OpenAIApi(configuration);

export default openaiInternal;