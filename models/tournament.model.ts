import { Schema, model, Document } from 'mongoose';
import { IUser } from './user.model';

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
}

const standingSchema = new Schema(
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

const Tournament = model<ITournament>('Tournament', tournamentSchema);

export default Tournament;
