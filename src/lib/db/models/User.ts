import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  _id: string;
  email: string;
  name: string;
  username: string;
  password?: string;
  avatar?: string;
  provider: 'email' | 'google';
  pagesRead: number;
  booksCompleted: number;
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
    },
    pagesRead: {
      type: Number,
      default: 0,
    },
    booksCompleted: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes separately to avoid duplication
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ pagesRead: -1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;