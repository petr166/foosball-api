import { Schema, model, Document, Model, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { IUser } from './user.model';
import { ITournament } from './tournament.model';

export interface ITournamentInvitation extends Document {
  id: string;
  tournament: string | ITournament;
  user: string | IUser;
}

export interface ITournamentInvitationModel
  extends Model<ITournamentInvitation>,
    PaginateModel<ITournamentInvitation> {
  cleanTournamentInvitations(): Promise<any>;
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

tournamentInvitationSchema.statics.cleanTournamentInvitations = async function(
  this: ITournamentInvitation
): Promise<any> {
  const invitationList = await TournamentInvitation.find({})
    .populate({ path: 'tournament', select: 'id' })
    .select('id tournament');

  return Promise.map(invitationList, async invitation => {
    if (invitation.tournament) return true;
    return invitation.remove();
  });
};

const TournamentInvitation = model<
  ITournamentInvitation,
  ITournamentInvitationModel
>('TournamentInvitation', tournamentInvitationSchema);

export default TournamentInvitation;
