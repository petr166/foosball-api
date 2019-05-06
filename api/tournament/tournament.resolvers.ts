import { ApolloError, AuthenticationError } from 'apollo-server';

import { Tournament } from '../../models';
import { extractReqFields } from '../../utils';
import { userFromParent } from '../user/user.resolvers';

export const tournament = async (p: any, { id }: any, ctx: any, info: any) => {
  const tournament = await Tournament.findById(id).select(
    extractReqFields(info)
  );
  return tournament ? tournament.toObject() : null;
};

export const tournamentFromParent = (tournamentKey: string) => async (
  p: any,
  args: any,
  ctx: any,
  info: any
) => {
  const tournament = await Tournament.findById(p[tournamentKey]).select(
    extractReqFields(info)
  );

  return tournament ? tournament.toObject() : null;
};

export const createTournament = async (
  p: any,
  { input }: any,
  { currentUser }: any
) => {
  const tournament = await Tournament.create({
    ...input,
    creatorUser: currentUser.id,
  });

  return tournament ? tournament.toObject() : null;
};

export const editTournament = async (
  p: any,
  { id, input }: any,
  { currentUser }: any
) => {
  const tournament = await Tournament.findById(id);

  if (!tournament) throw new ApolloError('Not found', 'NOT_FOUND');

  if (String(tournament.creatorUser) !== String(currentUser.id))
    throw new AuthenticationError('Unauthorized to edit tournament');

  Object.keys(input).forEach(key => {
    tournament.set(key, input[key]);
  });

  const updated = await tournament.save();

  return updated ? updated.toObject() : null;
};

export const joinTournament = async (
  p: any,
  { id }: any,
  { currentUser }: any
) => {
  const tournament = await Tournament.findById(id);
  if (!tournament) throw new ApolloError('Not found', 'NOT_FOUND');

  const updated = await tournament.joinTournament(currentUser.id);
  return updated ? updated.toObject() : null;
};

export default {
  Query: {
    tournament,
  },
  Mutation: {
    createTournament,
    editTournament,
    joinTournament,
  },
  Tournament: {
    creatorUser: userFromParent('creatorUser'),
  },
  Standing: {
    user: userFromParent('user'),
  },
};
