import { Schema, model, Document } from 'mongoose';

import { IUser } from './user.model';
import Tournament, { ITournament, IStanding } from './tournament.model';

import {
  SCORE_DIFF_FACTOR,
  POINTS_DIFF_FACTOR,
  GAME_COUNT_FACTOR,
} from '../config';

export interface IGame extends Document {
  id: string;
  tournament: string | ITournament;
  creatorUser: string | IUser;
  time: Date;
  team1: [string | IUser];
  team2: [string | IUser];
  score1: number;
  score2: number;
}

const gameSchema = new Schema(
  {
    tournament: {
      type: Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
    },
    creatorUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    time: {
      type: Date,
      default: () => new Date(),
      validate: (val: Date) => val < new Date(),
    },
    team1: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      required: true,
    },
    team2: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      required: true,
    },
    score1: {
      type: Number,
      required: true,
      min: 0,
    },
    score2: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

gameSchema.set('toObject', { getters: true, virtuals: true });

gameSchema.pre('save', async function(this: IGame) {
  const tournament = await Tournament.findById(this.get('tournament'));
  if (!tournament) throw new Error('Tournament not found.');

  // validate teams
  const teamError = new Error('Invalid teams');
  if (
    this.team1.length !== tournament.teamSize ||
    this.team2.length !== tournament.teamSize ||
    !tournament.hasParticipants([...this.team1, ...this.team2])
  )
    throw teamError;

  const getStanding = (userIdRaw: any): IStanding => {
    const userId = String(userIdRaw);
    const standing = tournament.standings.find(
      standing => String(standing.user) === userId
    );

    if (!standing) throw teamError;
    return standing;
  };

  if (this.isNew) {
    let winners = [
      ...(this.score1 > this.score2 ? this.team1 : this.team2),
    ].map(getStanding);
    let losers = [...(this.score1 < this.score2 ? this.team1 : this.team2)].map(
      getStanding
    );

    const pointSumReducer = (sum: number = 0, currentObj: IStanding) =>
      sum + currentObj.points;

    const pointDiff = Math.abs(
      winners.reduce(pointSumReducer, 0) / winners.length -
        losers.reduce(pointSumReducer, 0) / losers.length
    );
    const scoreDiff = Math.abs(this.score1 - this.score2);

    winners = winners.map((winnerStanding: IStanding) => {
      winnerStanding.points +=
        (10 + scoreDiff * SCORE_DIFF_FACTOR + pointDiff * POINTS_DIFF_FACTOR) /
        (winnerStanding.played * GAME_COUNT_FACTOR);
      winnerStanding.played += 1;
      winnerStanding.won += 1;

      return winnerStanding;
    });

    losers = losers.map((loserStanding: IStanding) => {
      loserStanding.played += 1;
      return loserStanding;
    });

    await tournament.editStandings([...winners, ...losers]);
  }
});

const Game = model<IGame>('Game', gameSchema);

export default Game;
