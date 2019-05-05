import { Schema, model, Document } from 'mongoose';
import { hash, compare } from 'bcrypt';
import { isEmail } from 'validator';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  facebookId?: string;
  checkPassword(password: string): Promise<boolean>;
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

// compare password with db hash
userSchema.methods.checkPassword = async function(
  password: string
): Promise<boolean> {
  return compare(password, this.get('password'));
};

const User = model<IUser>('User', userSchema);

export default User;
