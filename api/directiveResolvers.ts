import { AuthenticationError } from 'apollo-server';

import { User } from '../models';
import { verifyToken } from '../utils';

export const isAuthenticated = async (
  next: Function,
  source: any,
  args: any,
  ctx: any
) => {
  const { authorization } = ctx;

  const authError = new AuthenticationError('Unauthorized');
  if (!authorization) throw authError;

  try {
    const data: any = verifyToken(authorization);
    if (!data) throw authError;

    const user = await User.findById(data.userId, '-password');
    if (!user) throw authError;

    // set currentUser on context
    ctx.currentUser = user;
    return next();
  } catch (e) {
    throw authError;
  }
};

export default {
  isAuthenticated,
};
