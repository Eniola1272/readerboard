import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db/mongodb";
import { Book } from "@/lib/db/models/Book";
import Link from "next/link";

// Define a type for the book data returned from the database
// Mongoose documents often have _id and store object properties
interface BookItem {
  _id: string;
  userId: string;
  title: string;
  author?: string;
  totalPages?: number;
  // Include other properties returned from the DB as needed
}

// 1. FIX: Removed '_' prefix and implemented the correct query filter
async function getUserBooks(userId: string): Promise<BookItem[]> {
  await connectDB();
  // Filter books by the logged-in user's ID
  const books = await Book.find({ uploadedBy: userId })
    .sort({ createdAt: -1 })
    .lean();

  // Use a type assertion to treat the result as a Promise<BookItem[]>
  return JSON.parse(JSON.stringify(books)) as BookItem[];
}

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // 2. The type of 'books' is now inferred as BookItem[] from the function return type
  const books = await getUserBooks(session.user.id);

  console.log("User ID:", session.user.id);
  console.log("Books found:", books);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
          <Link
            href="/upload"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Upload Book
          </Link>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No books yet
            </h3>
            <p className="mt-2 text-gray-600">
              Upload your first book to get started!
            </p>
            <Link
              href="/upload"
              className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload Book
            </Link>
          </div>
        ) : (
          // 3. FIX: Removed unnecessary IIFE (Immediately Invoked Function Expression)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* The type of 'book' is now correctly inferred as BookItem */}
            {books.map((book) => (
              <Link
                key={book._id}
                href={`/read/${book._id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <svg
                    className="w-20 h-20 text-blue-600"
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
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{book.author}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {book.totalPages} pages
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
