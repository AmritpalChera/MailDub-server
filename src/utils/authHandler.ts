import type { NextApiRequest } from 'next';


// validates the token and returns a boolean
export default async function authHandler(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader)  throw "Invalid authorization";;
  // the token is the mindplug key;
  const data = authHeader!.split(' ');
  const token = data[1];
  const user = data[2];
  if (token === 'maildubInternal') return user;
  throw 'Invalid Auth';
}