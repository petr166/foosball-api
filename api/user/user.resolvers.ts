import { ApolloError, UserInputError } from 'apollo-server';
import { fieldsProjection } from 'graphql-fields-list';

import { User } from '../../models';
import { signToken } from '../../utils';

export const users = async (p: any, args: any, ctx: any, info: any) => {
  const userList = await User.find(args).select(fieldsProjection(info));
  return userList ? userList.map(user => user.toObject()) : [];
};

export const user = async (p: any, { id }: any, ctx: any, info: any) => {
  const found = await User.findById(id).select(fieldsProjection(info));
  return found ? found.toObject() : null;
};

export const userWinStats = async (p: any) => {
  return User.getWinStats(p.id);
};

export const userTrophyCount = async (p: any) => {
  return User.getTrophyCount(p.id);
};

export const userGames = async (
  p: any,
  { first, cursor }: any,
  ctx: any,
  info: any
) => {
  const { docs, total } = await User.getGames(p.id, {
    limit: first,
    offset: cursor,
    select: fieldsProjection(info, {
      path: 'edges.node',
    }),
  });

  return {
    totalCount: total,
    pageInfo: {
      hasNextPage: total > cursor + first,
      endCursor: total,
    },
    edges: docs.map((doc, i) => ({
      node: doc.toObject(),
      cursor: cursor + i + 1,
    })),
  };
};

export const userFromParent = (userKey: string) => async (
  p: any,
  args: any,
  ctx: any,
  info: any
) => {
  const found = await User.findById(p[userKey]).select(fieldsProjection(info));
  return found ? found.toObject() : null;
};

export const register = async (p: any, { input }: any) => {
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
  User: {
    winStats: userWinStats,
    trophyCount: userTrophyCount,
    games: userGames,
  },
};
