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
  // Array of all pages the user has visited (optional for advanced features)
  visitedPages: number[];
  
  // Added standard Mongoose timestamp fields for better tracking
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
  visitedPages: { 
    type: [Number], 
    default: [] 
  },
}, {
    // Enable Mongoose timestamps (createdAt and updatedAt)
    timestamps: true 
});

// --- 2. Export the Typed Mongoose Model ---

// We explicitly cast the exported model to type Model<IProgress> 
// to ensure type safety when importing and querying the model.
export const Progress = (mongoose.models.Progress || 
  mongoose.model<IProgress>('Progress', ProgressSchema)
) as Model<IProgress>;