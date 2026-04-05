import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import Image from "next/image";

async function getLeaderboard() {
  try {
    await connectDB();
    const users = await User.find()
      .sort({ pagesRead: -1 })
      .limit(100)
      .select("name username avatar pagesRead booksCompleted")
      .lean();
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error("Leaderboard error:", error);
    return [];
  }
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Global Leaderboard
          </h1>
          <p className="text-gray-600 mt-2">Top readers this month</p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <p className="text-gray-600">No users yet. Be the first to read!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((user: any, index: number) => (
              <div
                key={user._id}
                className={`flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                  index === 0 ? "ring-2 ring-yellow-400" : ""
                } ${index === 1 ? "ring-2 ring-gray-300" : ""} ${
                  index === 2 ? "ring-2 ring-amber-600" : ""
                }`}
              >
                <div className="flex-shrink-0 w-12 text-center">
                  {index === 0 && <span className="text-3xl">🥇</span>}
                  {index === 1 && <span className="text-3xl">🥈</span>}
                  {index === 2 && <span className="text-3xl">🥉</span>}
                  {index > 2 && (
                    <span className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {user.pagesRead?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-500">pages read</p>
                </div>

                <div className="hidden sm:block text-right min-w-[80px]">
                  <p className="text-lg font-semibold text-gray-700">
                    {user.booksCompleted || 0}
                  </p>
                  <p className="text-xs text-gray-500">books</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
