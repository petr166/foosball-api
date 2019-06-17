import { CronJob } from 'cron';
import { Tournament } from '../models';

export const endTournamentsCron = () => {
  const job = new CronJob('* */10 * * * *', async () => {
    try {
      console.log('Running endTournaments cron job...');
      await Tournament.endTournaments();
    } catch (e) {
      console.log('There was an error ending tournaments', e);
    }
  });

  job.start();
  return job;
};
