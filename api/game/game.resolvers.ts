import { fieldsProjection } from 'graphql-fields-list';

import { Game, User } from '../../models';
import { tournamentFromParent } from '../tournament/tournament.resolvers';

export const createGame = async (
  p: any,
  { input }: any,
  { currentUser }: any
) => {
  const game = await Game.create({ ...input, creatorUser: currentUser.id });
  return game ? game.toObject() : null;
};

export const gameTeam = (field: string) => async (
  p: any,
  args: any,
  ctx: any,
  info: any
) => {
  return p[field].map((id: string) =>
    User.findById(id).select(fieldsProjection(info))
  );
};

export default {
  // Query: {
  //   tournamentInvitations,
  // },
  Mutation: {
    createGame,
  },
  Game: {
    team1: gameTeam('team1'),
    team2: gameTeam('team2'),
    tournament: tournamentFromParent('tournament'),
  },
};
