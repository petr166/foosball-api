import { ApolloError, UserInputError } from 'apollo-server';

import { User } from '../../models';
import { signToken, fieldsProjectionX } from '../../utils';

export const users = async (
  p: any,
  { term, first, cursor }: { term?: string; first: number; cursor: number },
  ctx: any,
  info: any
) => {
  let searchOptions = {};
  if (!!term && term.length > 1) {
    const regex = new RegExp(`\\b${term}`, 'i');
    searchOptions = {
      name: regex,
    };
  }

  const { docs, totalDocs = 0 } = await User.paginate(searchOptions, {
    limit: first,
    offset: cursor,
    select: fieldsProjectionX(info, {
      path: 'edges.node',
    }),
    sort: { name: 'asc' },
    collation: { locale: 'en' },
  });

  return {
    totalCount: totalDocs,
    pageInfo: {
      hasNextPage: totalDocs > cursor + first,
      endCursor: cursor + first,
    },
    edges: docs.map((doc, i) => ({
      node: doc.toObject(),
      cursor: cursor + i + 1,
    })),
  };
};

export const user = async (p: any, { id }: any, ctx: any, info: any) => {
  const found = await User.findById(id).select(fieldsProjectionX(info));
  return found ? found.toObject() : null;
};

export const userWinStats = async (p: any) => {
  return User.getWinStats(p.id);
};

export const userTrophyCount = async (p: any) => {
  return User.getTrophyCount(p.id);
};

export const userGamesConnection = async (
  p: any,
  { first, cursor }: any,
  ctx: any,
  info: any
) => {
  const { docs, total } = await User.getGames(p.id, {
    limit: first,
    offset: cursor,
    select: fieldsProjectionX(info, {
      path: 'edges.node',
    }),
  });

  return {
    totalCount: total,
    pageInfo: {
      hasNextPage: total > cursor + first,
      endCursor: cursor + first,
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
  const found = await User.findById(p[userKey]).select(fieldsProjectionX(info));
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
    games: userGamesConnection,
  },
};
