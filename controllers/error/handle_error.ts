import { NextApiResponse } from 'next';
import CustomServerError from './custom_server_error';

const handleError = (err: unknown, res: NextApiResponse) => {
  let unknowErr = err;
  if (err instanceof CustomServerError === false) {
    unknowErr = new CustomServerError({ statusCode: 499, message: 'unknown error' });
  }
  const customError = unknowErr as CustomServerError;
  res
    .status(customError.statusCode)
    .setHeader('location', customError.location ?? '')
    .send(customError.serializeErrors());
};

export default handleError;
