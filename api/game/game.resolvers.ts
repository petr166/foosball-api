import { Game } from '../../models';

export const createGame = async (
  p: any,
  { input }: any,
  { currentUser }: any
) => {
  const game = await Game.create({ ...input, creatorUser: currentUser.id });
  return game ? game.toObject() : null;
};

export default {
  // Query: {
  //   tournamentInvitations,
  // },
  Mutation: {
    createGame,
  },
};
