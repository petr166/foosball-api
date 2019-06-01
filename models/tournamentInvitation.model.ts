import { Schema, model, Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { IUser } from './user.model';
import { ITournament } from './tournament.model';

export interface ITournamentInvitation extends Document {
  id: string;
  tournament: string | ITournament;
  user: string | IUser;
}

const tournamentInvitationSchema = new Schema(
  {
    tournament: {
      type: Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

tournamentInvitationSchema.plugin(mongoosePaginate);

tournamentInvitationSchema.set('toObject', { getters: true, virtuals: true });

const TournamentInvitation = model<ITournamentInvitation>(
  'TournamentInvitation',
  tournamentInvitationSchema
);

export default TournamentInvitation;
