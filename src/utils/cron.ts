import { CronJob } from 'cron';
import { Tournament, Game, TournamentInvitation } from '../models';

const endTournamentsExec = async () => {
  console.log('endTournaments job running...');
  try {
    await Tournament.endTournaments();
    console.log('endTournaments job done!');
  } catch (e) {
    console.log('There was an error ending tournaments', e);
  }
};

export const endTournamentsCron = () => {
  endTournamentsExec();
  const job = new CronJob('*/1 * * * *', async () => {
    endTournamentsExec();
  });

  job.start();
  return job;
};

const cleanGamesExec = async () => {
  console.log('cleanGames job running...');
  try {
    await Game.cleanGames();
    console.log('cleanGames job done!');
  } catch (e) {
    console.log('There was an error cleaning games', e);
  }
};

export const cleanGamesCron = () => {
  cleanGamesExec();
  const job = new CronJob('*/10 * * * *', async () => {
    cleanGamesExec();
  });

  job.start();
  return job;
};

const cleanTournamentInvitationsExec = async () => {
  console.log('cleanTournamentInvitations job running...');
  try {
    await TournamentInvitation.cleanTournamentInvitations();
    console.log('cleanTournamentInvitations job done!');
  } catch (e) {
    console.log('There was an error cleaning invitations', e);
  }
};

export const cleanTournamentInvitationsCron = () => {
  cleanTournamentInvitationsExec();
  const job = new CronJob('*/10 * * * *', async () => {
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
