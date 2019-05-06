import { Schema, model, Document } from 'mongoose';

import { IUser } from './user.model';
import TournamentInvitation from './tournamentInvitation.model';

export interface IStanding extends Document {
  id: string;
  user: string | IUser;
  played: number;
  won: number;
  points: number;
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
  maxPlayers: 5 | 10 | 20 | 50;
  minGames: number;
  creatorUser: string | IUser;
  standings: [IStanding];
  joinTournament(userId: string | Schema.Types.ObjectId): Promise<any>;
  canJoin(userId: string | Schema.Types.ObjectId): Promise<boolean>;
}

const standingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
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
    points: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

standingSchema.set('toObject', { getters: true, virtuals: true });

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
      enum: [5, 10, 20, 50],
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
  },
  { timestamps: true }
);

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

tournamentSchema.methods.joinTournament = async function(
  userId: string | Schema.Types.ObjectId
): Promise<any> {
  if (!(await this.canJoin(userId)))
    throw new Error('This user cannot join the tournament.');

  const standings: [IStanding] = this.get('standings');
  if (standings.find(v => String(v.user) === String(userId)))
    throw new Error('User already participating.');

  this.set('standings', [...standings, { user: userId }]);
  return this.save();
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

const Tournament = model<ITournament>('Tournament', tournamentSchema);

export default Tournament;
