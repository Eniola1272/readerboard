import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  currentPage: { type: Number, default: 1 },
  visitedPages: { type: [Number], default: [] },
});

export const Progress = mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);