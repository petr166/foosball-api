import { CronJob } from 'cron';
import { Tournament, Game, TournamentInvitation } from '../models';

const endTournamentsExec = async () => {
  try {
    await Tournament.endTournaments();
  } catch (e) {
    console.log('There was an error ending tournaments', e);
  }
};

export const endTournamentsCron = () => {
  endTournamentsExec();
  const job = new CronJob('* */10 * * * *', async () => {
    endTournamentsExec();
  });

  job.start();
  return job;
};

const cleanGamesExec = async () => {
  try {
    await Game.cleanGames();
  } catch (e) {
    console.log('There was an error cleaning games', e);
  }
};

export const cleanGamesCron = () => {
  cleanGamesExec();
  const job = new CronJob('* */10 * * * *', async () => {
    cleanGamesExec();
  });

  job.start();
  return job;
};

const cleanTournamentInvitationsExec = async () => {
  try {
    await TournamentInvitation.cleanTournamentInvitations();
  } catch (e) {
    console.log('There was an error cleaning invitations', e);
  }
};

export const cleanTournamentInvitationsCron = () => {
  cleanTournamentInvitationsExec();
  const job = new CronJob('* */10 * * * *', async () => {
    cleanTournamentInvitationsExec();
  });

  job.start();
  return job;
};

export const appCrons = () => {
  return {
    endTournamentsCron: endTournamentsCron(),
    cleanGamesCron: cleanGamesCron(),
    cleanTournamentInvitationsCron: cleanTournamentInvitationsCron(),
  };
};
