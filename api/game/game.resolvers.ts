import { Game, User, Tournament } from '../../models';
import { tournamentFromParent } from '../tournament/tournament.resolvers';
import { fieldsProjectionX } from '../../utils';

export const createGame = async (
  p: any,
  { input }: any,
  { currentUser }: any
) => {
  const game = await Game.create({ ...input, creatorUser: currentUser.id });
  return game ? game.toObject() : null;
};

export const feedGames = async (
  p: any,
  {
    first,
    cursor,
  }: {
    first: number;
    cursor: number;
  },
  { currentUser }: any,
  info: any
) => {
  const tournaments = await Tournament.find({
    $or: [
      { creatorUser: currentUser.id },
      { 'standings.user': currentUser.id },
    ],
  }).select('id');
  const { docs, totalDocs = 0 } = await Game.paginate(
    {
      tournament: { $in: tournaments.map(v => v.id) },
    },
    {
      limit: first,
      offset: cursor,
      select: fieldsProjectionX(info, {
        path: 'edges.node',
      }),
      sort: '-time',
    }
  );

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

export const gameTeam = (field: string) => async (
  p: any,
  args: any,
  ctx: any,
  info: any
) => {
  return p[field].map((id: string) =>
    User.findById(id).select(fieldsProjectionX(info))
  );
};

export default {
  Query: {
    feedGames,
  },
  Mutation: {
    createGame,
  },
  Game: {
    team1: gameTeam('team1'),
    team2: gameTeam('team2'),
    tournament: tournamentFromParent('tournament'),
  },
};
