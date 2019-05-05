import { sign, verify } from 'jsonwebtoken';

import { SECRET_KEY, JWT_ISSUER, TOKEN_HEADER } from '../config';

export const signToken = (user: { id: string }) =>
  TOKEN_HEADER +
  sign({ userId: user.id }, SECRET_KEY, {
    issuer: JWT_ISSUER,
  });

export const verifyToken = (authorization: string) =>
  verify(authorization.replace(TOKEN_HEADER, ''), SECRET_KEY, {
    issuer: JWT_ISSUER,
  });
