# 📚 Readerboard

**Turn reading into a competition.** Track your reading progress, compete with friends, and climb the leaderboard. Every page counts. Every book matters.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

![Readerboard Demo](./public/demo.png)

## ✨ Features

- 🔐 **Authentication** - Secure login with Google OAuth or email
- 📖 **PDF Reader** - Built-in reader with dark mode and progress tracking
- 📊 **Automatic Tracking** - Every page turn is tracked automatically
- 🏆 **Global Leaderboard** - Compete with readers worldwide
- 📚 **Personal Library** - Upload and organize your books
- 💾 **Resume Reading** - Pick up exactly where you left off
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🎯 **Progress Tracking** - Unique page visit tracking (no double-counting)

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Viewer**: @react-pdf-viewer
- **Authentication**: NextAuth.js

### Backend
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **API**: Next.js API Routes
- **File Storage**: Local filesystem (upgradeable to S3/Vercel Blob)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Google OAuth credentials (optional)

### 1. Clone the repository
```bash
git clone https://github.com/Eniola1272/readerboard.git
cd readerboard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/readerboard?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Create uploads directory
```bash
mkdir -p public/uploads
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

### User
```typescript
{
  email: String,
  name: String,
  username: String,
  pagesRead: Number,
  booksCompleted: Number,
  joinDate: Date,
  lastActive: Date
}
```

### Book
```typescript
{
  title: String,
  author: String,
  totalPages: Number,
  fileUrl: String,
  fileType: 'pdf' | 'epub',
  uploadedBy: ObjectId,
  thumbnail: String,
  createdAt: Date
}
```

### Progress
```typescript
{
  userId: ObjectId,
  bookId: ObjectId,
  currentPage: Number,
  visitedPages: Number[],
  pagesRead: Number,
  startDate: Date,
  lastReadDate: Date,
  completed: Boolean
}
```

## 🎯 Usage

### Upload a Book
1. Sign in to your account
2. Navigate to "Upload Book"
3. Fill in book details (title, author, total pages)
4. Upload your PDF file
5. Start reading!

### Track Your Progress
- Open any book from your library
- Read normally - pages are tracked automatically
- Close and return anytime - progress is saved
- Check the leaderboard to see your ranking

### Compete on the Leaderboard
- Global leaderboard shows top 100 readers
- Rankings update in real-time
- Each unique page read counts toward your total
- No double-counting - re-reading the same page doesn't add points

## 🛠️ API Routes

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session

### Books
- `GET /api/books` - Get all books
- `POST /api/books/upload` - Upload a new book
- `GET /api/books?userId=:id` - Get user's books

### Progress
- `POST /api/progress` - Update reading progress
- `GET /api/progress?bookId=:id` - Get progress for a book

### Leaderboard
- `GET /api/leaderboard` - Get top 100 readers

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

```bash
vercel --prod
```

### Environment Variables for Production
Update your `.env` with production values:
- Set `NEXTAUTH_URL` to your domain
- Update `GOOGLE_CLIENT_ID` authorized redirect URIs
- Use production MongoDB connection string

### File Storage
For production, consider upgrading to:
- **AWS S3** - Scalable cloud storage
- **Vercel Blob** - Easy integration with Vercel
- **Cloudinary** - With image optimization

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues

- Large PDFs (>50MB) may take time to load
- EPUB support is limited (PDFs recommended)
- Page tracking relies on unique page visits

## 📋 Roadmap

- [ ] Reading streaks and daily goals
- [ ] Friends system and private leaderboards
- [ ] Book recommendations algorithm
- [ ] Mobile app (React Native)
- [ ] Reading statistics and analytics
- [ ] Book clubs and reading challenges
- [ ] Social features (comments, reviews)
- [ ] Dark/light theme toggle
- [ ] Audiobook support
- [ ] Offline reading capability

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@Eniola1272](https://github.com/Eniola1272)
- Twitter: [@eniaderounmu](https://twitter.com/eniaderounmu)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [MongoDB](https://www.mongodb.com/) - Database
- [React PDF Viewer](https://react-pdf-viewer.dev/) - PDF rendering
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## 📞 Support

If you have any questions or run into issues:
- Open an [issue](https://github.com/Eniola1272/readerboard/issues)
- Email: aderounmueniola60@gmail.com

---

**⭐ If you like this project, please give it a star!**

Built with ❤️ and ☕