import Stripe from "stripe";

const key = process.env.NODE_ENV === "development" ?  process.env.STRIPE_KEY! : process.env.STRIPE_KEY_PROD!;
const stripe = new Stripe(key, { apiVersion: '2022-11-15' });

export default stripe;

