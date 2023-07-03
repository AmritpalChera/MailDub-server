// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { object, string, array } from 'zod';
import runMiddleware from '@/utils/setup/middleware';
import openai from '@/utils/setup/openai';
import axios from 'axios';
import { leapGenerate, leapGet } from '@/utils/leap';
import { wait } from '@/utils/misc';
import authHandler from '@/utils/authHandler';
import supabaseInternal from '@/utils/setup/supabase';

type Data = {
  url?: string,
  error?: string,
  premium?: boolean
}

const bodySchema = object({
  emailSummary: string(),
});


const getTemplate = (emailSummary: string) => {
  const systemTemplate = `
    I am a visual person good with imagining scenarios. I create engaging scenes from a given input.

    Things not to include in visuals: 
     - Words, text, hashtags, logos
    
    Things to include: 
     - vivid, uhd, hyper realistic, ultra detailed
  `
  const formattedContent = `Describe a realistic scene of the given text with minimum words. Keep it concise and to point. Answer within 100 characters. \n\n Text:\n${emailSummary}`;
  const chatData: any = [
    { role: 'system', content: systemTemplate},
    { role: 'user', content: formattedContent }
  ];
  return chatData;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  await runMiddleware(req, res);

  let userId: any;
  try {
    userId = await authHandler(req);
  } catch (e: any) {
    console.log(e)
    return res.status(403).json({error: e})
  };

  if (!userId) {
    res.json({ url: '' });
    return;
  }
  // check if user is customer, otherwise return subscription text.
  const customerData = await supabaseInternal.from('customers').select().eq('userId', userId).single();
  if (customerData.error) {
    console.log(customerData.error);
    res.json({ url: '' });
    return;
  }

  if (req.method === 'POST') {
    const result = bodySchema.safeParse(req.body);
    if (!result.success) return res.status(400).send({ error: 'Invalid required parameters'});
    const { emailSummary } = req.body;

    try {
      
      const chatData = getTemplate(emailSummary);
      const baseCompletion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo-0613',
        messages: chatData,
        temperature: 1.0,
        max_tokens: 2000,
        top_p: 1
      });
    
      const basePromptOutput = baseCompletion.data?.choices[0].message?.content;
      // console.log('email summary is: ', emailSummary)
      // console.log('described scene is: ', basePromptOutput)

      if (!basePromptOutput) throw 'Could not generate visual description';

      const generateImageData = await leapGenerate(basePromptOutput);
      await wait(5000);
      const generatedimage = await leapGet(basePromptOutput, generateImageData.id);
      const uri = generatedimage?.images[0]?.uri;
      res.json({ url: uri });

    } catch (e) {
      console.log(e);
      res.status(200).json({ error: 'Could not generate image' });
    }

  } else {
    res.status(400).json({ error: 'Invalid request' });
  }
}
