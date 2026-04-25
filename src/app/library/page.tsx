import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db/mongodb";
import { Book } from "@/lib/db/models/Book";
import Link from "next/link";
import Image from "next/image";

interface BookItem {
  _id: string;
  title: string;
  author?: string;
  totalPages?: number;
  thumbnail?: string;
}

async function getUserBooks(userId: string): Promise<BookItem[]> {
  await connectDB();
  const books = await Book.find({ uploadedBy: userId })
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(books)) as BookItem[];
}

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const books = await getUserBooks(session.user.id);

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl text-brand-950">My Library</h1>
            <p className="text-brand-500 mt-1">
              {books.length} {books.length === 1 ? "book" : "books"} in your collection
            </p>
          </div>
          <Link
            href="/upload"
            className="px-5 py-2.5 bg-brand-600 text-white rounded-pill hover:bg-brand-700 font-medium shadow-glow transition-all text-sm"
          >
            + Upload Book
          </Link>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-card shadow-soft border border-brand-200">
            <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-10 h-10 text-brand-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl text-brand-950 mb-2">No books yet</h3>
            <p className="text-brand-500 mb-6">Upload your first book to get started!</p>
            <Link
              href="/upload"
              className="inline-block px-6 py-3 bg-brand-600 text-white rounded-pill hover:bg-brand-700 font-medium shadow-glow transition-all"
            >
              Upload Book
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {books.map((book) => (
              <Link
                key={book._id}
                href={`/read/${book._id}`}
                className="bg-white rounded-card shadow-soft hover:shadow-glow transition-all duration-300 overflow-hidden group hover:-translate-y-1 border border-brand-200"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-brand-100 to-brand-200 relative overflow-hidden">
                  {book.thumbnail && book.thumbnail !== '/book-placeholder.png' ? (
                    <Image
                      src={book.thumbnail}
                      alt={book.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-300/20 to-brand-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-16 h-16 text-brand-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-serif font-normal text-brand-950 group-hover:text-brand-600 transition-colors line-clamp-2 text-base leading-snug">
                    {book.title}
                  </h3>
                  {book.author && (
                    <p className="text-xs text-brand-500 mt-1 truncate">{book.author}</p>
                  )}
                  {book.totalPages && (
                    <p className="text-xs text-brand-400 mt-1.5 font-medium">
                      {book.totalPages} pages
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
