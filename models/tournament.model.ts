import {
  Schema,
  model,
  Document,
  Model,
  PaginateModel,
  PaginateOptions,
  PaginateResult,
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { IUser } from './user.model';
import TournamentInvitation from './tournamentInvitation.model';
import { FRADRAG_PERCENTAGE } from '../config';
import Game, { IGame } from './game.model';

export interface IStanding extends Document {
  id: string;
  user: string | IUser;
  played: number;
  won: number;
  points: number;
  rawPoints: number;
}

export interface ITournament extends Document {
  id: string;
  name: string;
  cover?: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  privacy: 'public' | 'private';
  teamSize: 1 | 2;
  maxPlayers: 10 | 20 | 50 | 100;
  minGames: number;
  creatorUser: string | IUser;
  standings: IStanding[];
  joinTournament(
    userId: string | Schema.Types.ObjectId
  ): Promise<ITournament | null>;
  canJoin(userId: string | Schema.Types.ObjectId): Promise<boolean>;
  hasParticipants(userIds: any[]): boolean;
  editStandings(newStandings: IStanding[]): Promise<ITournament | null>;
}

export interface ITournamentModel
  extends Model<ITournament>,
    PaginateModel<ITournament> {
  getGames(
    id: string,
    options?: PaginateOptions
  ): Promise<PaginateResult<IGame>>;
}

export const standingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    played: { type: Number, default: 0, min: 0 },
    won: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: function(this: IStanding, val: number) {
          return val <= this.played;
        },
        message: 'Invalid won count.',
      },
    },
    // is Float in gql
    rawPoints: { type: Number, default: 0, min: 0, select: true },
  },
  { timestamps: true }
);

standingSchema.set('toObject', { getters: true, virtuals: true });

standingSchema.virtual('points').get(function(this: IStanding) {
  const fullPoints =
    this.rawPoints * FRADRAG_PERCENTAGE +
    this.rawPoints * (1 - FRADRAG_PERCENTAGE) * (this.won / this.played || 1);
  return +fullPoints.toFixed(1);
});

const tournamentSchema = new Schema(
  {
    name: { type: String, required: true },
    cover: { type: String, trim: true },
    description: { type: String },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(this: ITournament, val: Date) {
          return this.isNew ? val > new Date() : true;
        },
        message: () => 'Invalid startDate.',
      },
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(this: ITournament, val: Date) {
          return val > this.startDate;
        },
        message: () => 'Invalid endDate.',
      },
    },
    privacy: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    teamSize: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },
    maxPlayers: {
      type: Number,
      enum: [10, 20, 50, 100],
      default: 20,
    },
    minGames: {
      type: Number,
      default: 10,
      min: 1,
    },
    creatorUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    standings: {
      type: [standingSchema],
      default: [],
    },
    winner: {
      type: standingSchema,
    },
  },
  { timestamps: true }
);

tournamentSchema.plugin(mongoosePaginate);

tournamentSchema.set('toObject', { getters: true, virtuals: true });

tournamentSchema.pre('save', function() {
  if (this.isNew) {
    this.set('standings', [
      {
        user: this.get('creatorUser'),
      },
    ]);
  }
});

tournamentSchema.statics.getGames = async function(
  id: string,
  { limit = 10, offset = 0, ...options }: PaginateOptions = {}
): Promise<PaginateResult<IGame>> {
  return Game.paginate(
    { tournament: id },
    {
      sort: '-time',
      limit,
      offset,
      ...options,
    }
  );
};

tournamentSchema.methods.joinTournament = async function(
  userId: string | Schema.Types.ObjectId
): Promise<ITournament | null> {
  if (!(await this.canJoin(userId)))
    throw new Error('This user cannot join the tournament.');

  const standings: [IStanding] = this.get('standings');
  if (standings.find(v => String(v.user) === String(userId)))
    throw new Error('User already participating.');

  this.set('standings', [...standings, { user: userId }]);
  const updated = await this.save();

  TournamentInvitation.findOneAndDelete({
    user: userId,
    tournament: this.get('id'),
  }).exec();

  return updated;
};

tournamentSchema.methods.canJoin = async function(
  userId: string | Schema.Types.ObjectId
): Promise<boolean> {
  return (
    this.get('privacy') === 'public' ||
    !!(await TournamentInvitation.findOne({
      tournament: this.get('id'),
      user: userId,
    }))
  );
};

tournamentSchema.methods.hasParticipants = function(
  this: ITournament,
  userIds: any[]
): boolean {
  return !userIds.some(userIdRaw => {
    const userId = String(userIdRaw);
    return !this.standings.find(v => String(v.user) === userId);
  });
};

tournamentSchema.methods.editStandings = async function(
  this: ITournament,
  newStandings: IStanding[]
): Promise<ITournament | null> {
  const standings: IStanding[] = this.get('standings');

  newStandings.forEach(newStanding => {
    const index = standings.findIndex(
      v => String(v.user) === String(newStanding.user)
    );

    if (index > -1) {
      Object.keys(newStanding).forEach(key => {
        standings[index].set(key, newStanding.get(key));
      });
    }
  });

  return this.save();
};

const Tournament = model<ITournament, ITournamentModel>(
  'Tournament',
  tournamentSchema
);

export default Tournament;
