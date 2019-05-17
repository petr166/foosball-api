import {
  Schema,
  model,
  Document,
  Model,
  PaginateResult,
  PaginateOptions,
} from 'mongoose';
import { hash, compare } from 'bcrypt';
import { isEmail } from 'validator';
import { isString } from 'lodash';

import Game, { IGame } from './game.model';
import Tournament from './tournament.model';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  facebookId?: string;
  checkPassword(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUser> {
  getWinStats(id: string): Promise<number[]>;
  getTrophyCount(id: string): Promise<number>;
  getGames(
    id: string,
    options?: PaginateOptions
  ): Promise<PaginateResult<IGame>>;
}

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: {
        validator: (val: string) => isEmail(val),
        message: () => 'Invalid email.',
      },
    },
    password: {
      type: String,
      required: function(this: IUser) {
        return !this.facebookId;
      },
    },
    avatar: { type: String, trim: true },
    facebookId: { type: String, trim: true, unique: true, sparse: true },
  },
  { timestamps: true }
);

userSchema.set('toObject', { getters: true, virtuals: true });

userSchema.pre('save', async function() {
  // hash password before saving it to db
  if (this.isModified('password')) {
    const password = this.get('password');

    if (!password.length || password.length < 8) {
      throw new Error('Invalid password');
    }

    const hashedPass = await hash(password, 10);
    return this.set('password', hashedPass);
  }
});

userSchema.statics.getWinStats = async function(id: string): Promise<number[]> {
  const games = await Game.find({ $or: [{ team1: id }, { team2: id }] }).select(
    'team1 team2 score1 score2'
  );

  let gameCount = games.length;
  let wins = 0;

  games.forEach(({ team1, team2, score1, score2 }) => {
    if (
      (team1.includes(id) && score1 > score2) ||
      (team2.includes(id) && score2 > score1)
    ) {
      wins += 1;
    }
  });

  return [wins, gameCount];
};

userSchema.statics.getTrophyCount = async function(
  id: string
): Promise<number> {
  return Tournament.countDocuments({ 'winner.user': id });
};

userSchema.statics.getGames = async function(
  id: string,
  { limit = 5, offset = 0, ...options }: PaginateOptions = {}
): Promise<PaginateResult<IGame>> {
  return Game.paginate(
    { $or: [{ team1: id }, { team2: id }] },
    {
      sort: '-time',
      limit,
      offset,
      ...options,
    }
  );
};

// compare password with db hash
userSchema.methods.checkPassword = async function(
  password: string
): Promise<boolean> {
  return compare(password, this.get('password'));
};

const User = model<IUser, IUserModel>('User', userSchema);

export default User;
