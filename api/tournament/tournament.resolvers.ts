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

export const tournaments = async (
  p: any,
  {
    term,
    first,
    cursor,
    category = 'mine',
  }: {
    term?: String;
    category?: 'mine' | 'public' | 'private' | 'old';
    first: number;
    cursor: number;
  },
  { currentUser }: any,
  info: any
) => {
  const now = new Date();
  let findQuery: any;
  switch (category) {
    case 'mine':
    default:
      findQuery = {
        $and: [
          {
            $or: [
              { creatorUser: currentUser.id },
              { 'standings.user': currentUser.id },
            ],
          },
          { endDate: { $gte: now.getTime() - 2 * 86400000 } },
        ],
      };
      break;
    case 'public':
      findQuery = {
        $and: [
          { creatorUser: { $ne: currentUser.id } },
          { 'standings.user': { $ne: currentUser.id } },
          { privacy: 'public' },
          { endDate: { $gte: now.getTime() - 2 * 86400000 } },
        ],
      };
      break;
    case 'old':
      findQuery = {
        $and: [
          {
            $or: [
              { creatorUser: currentUser.id },
              { 'standings.user': currentUser.id },
            ],
          },
          { endDate: { $lte: now.getTime() - 2 * 86400000 } },
        ],
      };
      break;
  }

  if (!!term && term.length > 1) {
    const regex = new RegExp(`\\b${term}`, 'i');
    findQuery.name = regex;
  }

  const { docs, totalDocs = 0 } = await Tournament.paginate(findQuery, {
    limit: first,
    offset: cursor,
    select: fieldsProjectionX(info, { path: 'edges.node' }),
    sort: { startDate: 'asc' },
    collation: { locale: 'en' },
  });

  const hasNextPage = totalDocs > cursor + first;

  return {
    totalCount: totalDocs,
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage ? cursor + first : totalDocs,
    },
    edges: docs.map((doc, i) => ({
      node: doc.toObject(),
      cursor: cursor + i + 1,
    })),
  };
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
    tournaments,
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
