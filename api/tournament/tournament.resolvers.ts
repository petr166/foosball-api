import { ApolloError, AuthenticationError } from 'apollo-server';

import { Tournament, TournamentInvitation } from '../../models';
import { userFromParent } from '../user/user.resolvers';
import { fieldsProjectionX } from '../../utils';

export const tournament = async (p: any, { id }: any, ctx: any, info: any) => {
  const tournament = await Tournament.findById(id).select(
    fieldsProjectionX(info, {
      resolvableFields: ['creatorUser', 'standings.user'],
    })
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
    fieldsProjectionX(info)
  );

  return tournament ? tournament.toObject() : null;
};

export const createTournament = async (
  p: any,
  { input: { inviteList, ...input } }: any,
  { currentUser }: any
) => {
  const tournament = await Tournament.create({
    ...input,
    creatorUser: currentUser.id,
  });

  // create tournament invitations
  if (!!inviteList && inviteList.length) {
    await Promise.map(inviteList, async userId => {
      const found = await TournamentInvitation.findOne({
        tournament: tournament.id,
        user: userId,
      });

      if (found) return found;

      return TournamentInvitation.create({
        tournament: tournament.id,
        user: userId,
      });
    });
  }

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
