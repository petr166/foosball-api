import { ApolloError } from 'apollo-server';

import { User } from '../../models';
import { signToken } from '../../utils';

export const login = async (p: any, { input: { email, password } }: any) => {
  const wrongCredsErr = new ApolloError('Wrong credentials.', 'WRONG_CREDS');

  const user = await User.findOne({ email: email.trim() });
  if (!user) throw wrongCredsErr;

  const passwordMatched = await user.checkPassword(password);
  if (!passwordMatched) throw wrongCredsErr;

  const token = signToken(user);

  return { token, user: user.toObject() };
};

export default {
  Mutation: {
    login,
  },
};
