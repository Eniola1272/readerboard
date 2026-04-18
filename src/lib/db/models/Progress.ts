import mongoose, { Document, Model } from 'mongoose';

// --- 1. Define the TypeScript Interface for the Progress Document ---

// IProgress extends Document to inherit Mongoose properties like _id, save(), etc.
export interface IProgress extends Document {
  // References the User who owns this progress record
  userId: mongoose.Types.ObjectId;
  // References the Book the user is reading
  bookId: mongoose.Types.ObjectId;
  // The last page the user visited
  currentPage: number;
  // Total unique pages the user has read in this book
  pagesRead: number;
  // Array of all unique pages the user has visited
  visitedPages: number[];
  // The last time the user read this book
  lastReadDate: Date;
  // Whether the user has finished the book
  completed: boolean;

  // Mongoose timestamp fields
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new mongoose.Schema<IProgress>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  bookId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book', 
    required: true 
  },
  currentPage: { 
    type: Number, 
    default: 1 
  },
  pagesRead: {
    type: Number,
    default: 0,
  },
  visitedPages: { 
    type: [Number], 
    default: [] 
  },
  lastReadDate: {
    type: Date,
    default: Date.now,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
    timestamps: true 
});

// Compound index for the most common query pattern (one progress per user per book)
ProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

// --- 2. Export the Typed Mongoose Model ---

// We explicitly cast the exported model to type Model<IProgress> 
// to ensure type safety when importing and querying the model.
export const Progress = (mongoose.models.Progress || 
  mongoose.model<IProgress>('Progress', ProgressSchema)
) as Model<IProgress>;