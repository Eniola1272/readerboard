import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, default: 'Unknown' },
  totalPages: { type: Number, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'epub'], required: true },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true  // Make sure this is here!
  },
  thumbnail: { type: String, default: '/book-placeholder.png' },
  isPublic: { type: Boolean, default: false },
}, { timestamps: true });

export const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);