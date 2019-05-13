import { fieldsProjection } from 'graphql-fields-list';

import { TournamentInvitation } from '../../models';
import { tournamentFromParent } from '../tournament/tournament.resolvers';

export const tournamentInvitations = async (
  p: any,
  args: any,
  { currentUser }: any,
  info: any
) => {
  const tournamentInvitations = await TournamentInvitation.find({
    user: currentUser.id,
  }).select(fieldsProjection(info));
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
