"use client";
import { DOMAIN } from "@/utils/setup/domain";
import runMiddleware from "@/utils/setup/middleware";
import stripe from "@/utils/setup/stripe";
import supabase from "@/utils/setup/supabase";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res);
  const prices = await stripe.prices.list({
    lookup_keys: [req.body.lookup_key],
    expand: ['data.product'],
  });
  const session = await stripe.checkout.sessions.create({
    billing_address_collection: 'auto',
    line_items: [
      {
        price: prices.data[0].id,
        // For metered billing, do not pass quantity
        quantity: 1,

      },
    ],
    mode: 'subscription',
    customer_email: req.body.email,
    client_reference_id: req.body.userId,
    success_url: `${DOMAIN}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${DOMAIN}?canceled=true`,
  });

  res.redirect(303, session.url);
}

