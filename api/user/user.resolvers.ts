import { ApolloError, UserInputError } from 'apollo-server';

import { User } from '../../models';
import { signToken, extractReqFields } from '../../utils';

export const users = async (p: any, args: any, ctx: any, info: any) => {
  const userList = await User.find(args, extractReqFields(info));
  return userList ? userList.map(user => user.toObject()) : [];
};

export const user = async (p: any, { id }: any, ctx: any, info: any) => {
  const found = await User.findById(id, extractReqFields(info));
  return found ? found.toObject() : null;
};

export const register = async (p: any, { input }: any) => {
  await User.deleteMany({}); // TODO: remove
  const { password, repeatPassword } = input;
  if (password !== repeatPassword) {
    throw new UserInputError('Passwords do not match.');
  }

  const user = await User.create(input).catch((e: any) => {
    if (e.code === 11000) {
      throw new ApolloError('The account is taken.', 'DUPLICATE');
    }
    throw e;
  });
  const token = signToken(user);

  return user ? { token, user: user.toObject() } : null;
};

export const editUser = async (
  p: any,
  { input }: any,
  { currentUser }: any
) => {
  const { password, repeatPassword } = input;
  if (password && password !== repeatPassword) {
    throw new UserInputError('Passwords do not match.');
  }

  Object.keys(input).forEach(key => {
    currentUser[key] = input[key];
  });

  const updated = await currentUser.save().catch((e: any) => {
    if (e.code === 11000) {
      throw new ApolloError('The account is taken.', 'DUPLICATE');
    }
    throw e;
  });

  return updated ? updated.toObject() : null;
};

export default {
  Query: {
    users,
    user,
  },
  Mutation: {
    register,
    editUser,
  },
};
