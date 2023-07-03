import openai, { limiterOpenai } from "../setup/openai";
import openaiInternal, { limiterOpenaiInt } from "../setup/openaiInternal";


const baseComp = (chatData: any, internal?: boolean) => {
  
  if (internal) {
    return limiterOpenaiInt.schedule (() => openaiInternal.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: chatData,
      temperature: 0.5,
      max_tokens: 2000,
      frequency_penalty: 0.5,
      presence_penalty: 0.3,
    }));
  }

  return limiterOpenai.schedule(() => openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: chatData,
    temperature: 0.5,
    max_tokens: 2000,
    frequency_penalty: 0.5,
    presence_penalty: 0.3,
  }));
}

type chatGptTypes = {
  chatData: any,
  noAI?: boolean,
  internal?: boolean
}

const callChatGpt = async ({chatData, noAI, internal}: chatGptTypes) => {
  try {
    let baseCompletion = await baseComp(chatData, internal).catch((err: any) => {
      console.log('ran into error', err);
      return baseComp(chatData, internal);
    });
    // If a human said the same thing as above, what would they say? Keep it concise
    let generatedCompletion = baseCompletion.data?.choices[0].message?.content;
    
    if (noAI && generatedCompletion?.includes("AI language model")) {
      const newChatData = [
        { role: 'user', content: generatedCompletion },
        { role: 'user', content: `Be a human and give me the same context but now as a human. Don't mention  your human identity` }
      ];
      baseCompletion = await baseComp(newChatData);
    }
    return baseCompletion;
  } catch (e:any) {
    console.log('error is: ', e?.response?.data)
    throw "Could no create completion";
  };
};

export default callChatGpt;