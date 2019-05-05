import { Tournament, TournamentInvitation } from '../../models';
import { extractReqFields } from '../../utils';

export const tournamentInvitations = async (
  p: any,
  args: any,
  { currentUser }: any,
  info: any
) => {
  const tournamentInvitations = await TournamentInvitation.find(
    { user: currentUser.id },
    extractReqFields(info)
  );
  return tournamentInvitations.map(v => v.toObject());
};

export const tournamentInvitationTournament = async (
  p: any,
  args: any,
  ctx: any,
  info: any
) => {
  const tournament = await Tournament.findById(
    p.tournament,
    extractReqFields(info)
  );

  return tournament ? tournament.toObject() : null;
};

export default {
  Query: {
    tournamentInvitations,
  },
  TournamentInvitation: {
    tournament: tournamentInvitationTournament,
  },
};
