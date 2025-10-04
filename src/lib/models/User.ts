import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  pagesRead: { type: Number, default: 0 },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);