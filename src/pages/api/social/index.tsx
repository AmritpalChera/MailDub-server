// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { object, string, array } from 'zod';
import runMiddleware from '@/utils/setup/middleware';
import openai from '@/utils/setup/openai';
import authHandler from '@/utils/authHandler';
import supabaseInternal from '@/utils/setup/supabase';

type Data = {
  text?: string,
  error?: string,
  premium?: boolean
}

const bodySchema = object({
  social: string(),
  emailContent: string(),
});


const getTwitterTemplate = (emailContent: string) => {
  const systemTemplate = `
    You are a Twitter expert. You write simple copy for Twitter.

    Rules of Twitter:
      1. Total characters must be less than 280
    
    Important Tips:
      1. Tweets are conversational
      2. Tweets use simple words.
      3. Tweets make clear calls-to-action
  `;
  const formattedContent = `Write me a Twitter post from the given email. Keep length less than 280 characters. \n\n Email: \n\n${emailContent}\n\nShort answer:`;
  const chatData: any = [
    { role: 'system', content: systemTemplate},
    { role: 'user', content: formattedContent }
  ];
  return chatData;
};

const getInstagramTemplate = (emailContent: string) => {
  const systemTemplate = `
    You are an Instagram expert. You write catchy content for Instagram.

    Rules:
      1. Keep it concise and short
      2. Only keep key details
    
    TODO:
      1. Write a cathcy caption
      2. List up to 5 important points
      3. Make it appealing
  `;
  const formattedContent = `Write me an Instagram post from the given email with up to 5 key points. Keep it short and concise! \n\n Email: \n\n${emailContent}\n\nShort answer:`;
  const chatData: any = [
    { role: 'system', content: systemTemplate},
    { role: 'user', content: formattedContent }
  ];
  return chatData;
};

const getFacebookTemplate = (emailContent: string) => {
  const systemTemplate = `
    You are a marketing content expert. 
    You make short and concise posts for social media.
    You make visually appealing content for facebook.
    You list out important points in the post
  `;
  const formattedContent = `Write me an Facebook post from the given email with up to 5 key points. Keep it to point! \n\n Email: \n\n${emailContent}\n\nShort answer:`;
  const chatData: any = [
    { role: 'system', content: systemTemplate},
    { role: 'user', content: formattedContent }
  ];
  return chatData;
};

const getLinkedInTemplate = (emailContent: string) => {
  const systemTemplate = `
    You are an Facebook expert. You write catchy content for Facebook.

    Rules:
      1. Text must be short
      2. Extract key points
    
    Important Tips:
      1. Write a compelling caption
      2. Use a personal tone.
      3. Use clear calls to actions
    
    TODO:
      1. Filter out important details from the email
      2. Write good content
  `;
  const formattedContent = `Write me an LinkedIn post from the given email. Write short sentences. \n\n Email: \n\n${emailContent}\n\nShort answer:`;
  const chatData: any = [
    { role: 'system', content: systemTemplate},
    { role: 'user', content: formattedContent }
  ];
  return chatData;
};


const getTemplate = (socialMedia: string, emailContent: string) => {
  if (socialMedia === 'twitter') return getTwitterTemplate(emailContent);
  else if (socialMedia === 'instagram') return getInstagramTemplate(emailContent);
  else if (socialMedia === 'facebook') return getFacebookTemplate(emailContent);
  else if (socialMedia === 'linkedin') return getLinkedInTemplate(emailContent);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  await runMiddleware(req, res);
  let userId: string;
  try {
    userId = await authHandler(req);
  } catch (e: any) {
    console.log(e)
    return res.status(403).json({error: e})
  };

  if (!userId) {
    res.json({ text: 'Invalid Authorization. Please login.' });
    return;
  }


  const analytics = await supabaseInternal.from('analytics').select().eq('userId', userId).single();
  if (!analytics.data) {
    await supabaseInternal.from('analytics').insert({ userId: userId });
  } else if (analytics.data && analytics.data.monthlyMessages > 10) {
    // check if user is customer, otherwise return subscription text.
    const customerData = await supabaseInternal.from('customers').select().eq('userId', userId).single();
    if (customerData.error) {
      console.log(customerData.error);
      res.json({ text: 'Visit MailDub.Club to subscribe to the service' });
      return;
    }
  }

  

  if (req.method === 'POST') {
    const result = bodySchema.safeParse(req.body);
    if (!result.success) return res.status(400).send({ error: 'Invalid required parameters'});
    const { social, emailContent } = req.body;

    try {
      
      const chatData = getTemplate(social, emailContent);
      const baseCompletion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: chatData,
        temperature: 1.0,
        max_tokens: 2000,
        top_p: 1
      });
    
      const basePromptOutput = baseCompletion.data?.choices[0].message?.content;

      res.json({ text: basePromptOutput });

    } catch (e) {
      console.log(e);
      res.status(200).json({ error: 'Could not fetch info' });
    }
    await supabaseInternal.from('analytics').upsert({userId: userId, monthlyMessages: (analytics.data?.monthlyMessages || 0) + 1})
  } else {
    res.status(400).json({ error: 'Invalid request' });
  }
}
