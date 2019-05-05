import { Tournament, User } from '../../models';
import { extractReqFields } from '../../utils';

export const tournament = async (p: any, { id }: any, ctx: any, info: any) => {
  const tournament = await Tournament.findById(id, extractReqFields(info));
  return tournament ? tournament.toObject() : null;
};

export const tournamentCreatorUser = async (
  p: any,
  args: any,
  ctx: any,
  info: any
) => {
  const user = await User.findById(p.creatorUser, extractReqFields(info));
  return user ? user.toObject() : null;
};

export const tournamentStandingsUser = async (
  p: any,
  args: any,
  ctx: any,
  info: any
) => {
  const user = await User.findById(p.user, extractReqFields(info));
  return user ? user.toObject() : null;
};

export const addTournament = async (
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

export default {
  Query: {
    tournament,
  },
  Mutation: {
    addTournament,
  },
  Tournament: {
    creatorUser: tournamentCreatorUser,
  },
  Standing: {
    user: tournamentStandingsUser,
  },
};
