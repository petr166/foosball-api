import { TournamentInvitation } from '../../models';
import { tournamentFromParent } from '../tournament/tournament.resolvers';
import { fieldsProjectionX } from '../../utils';

export const tournamentInvitations = async (
  p: any,
  args: any,
  { currentUser }: any,
  info: any
) => {
  const tournamentInvitations = await TournamentInvitation.find({
    user: currentUser.id,
  }).select(fieldsProjectionX(info));
  return tournamentInvitations.map(v => v.toObject());
};

export default {
  Query: {
    tournamentInvitations,
  },
  TournamentInvitation: {
    tournament: tournamentFromParent('tournament'),
  },
};
