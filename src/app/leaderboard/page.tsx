import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import Image from "next/image";

export const dynamic = "force-dynamic";

interface LeaderboardUser {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  pagesRead: number;
  booksCompleted: number;
}

async function getLeaderboard() {
  try {
    await connectDB();
    const users = await User.find()
      .sort({ pagesRead: -1 })
      .limit(100)
      .select("name username avatar pagesRead booksCompleted")
      .lean();
    return JSON.parse(JSON.stringify(users)) as LeaderboardUser[];
  } catch (error) {
    console.error("Leaderboard error:", error);
    return [];
  }
}

function getTrend(index: number, total: number): "up" | "down" | "neutral" {
  if (total <= 5) return "neutral";
  const pct = index / total;
  if (pct < 0.33) return "up";
  if (pct > 0.66) return "down";
  return "neutral";
}

const rankBadgeColors: Record<number, string> = {
  1: "bg-amber-400",
  2: "bg-gray-400",
  3: "bg-amber-600",
};

export default async function LeaderboardPage() {
  const [leaderboard, session] = await Promise.all([
    getLeaderboard(),
    getServerSession(authOptions),
  ]);

  const currentUserId = (session?.user as { id?: string })?.id;
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // Podium order: 2nd | 1st | 3rd
  const podiumSlots = [
    { data: top3[1], rank: 2, height: "h-28", size: "w-16 h-16", textSize: "text-xl" },
    { data: top3[0], rank: 1, height: "h-36", size: "w-20 h-20", textSize: "text-2xl" },
    { data: top3[2], rank: 3, height: "h-24", size: "w-16 h-16", textSize: "text-xl" },
  ];

  const ringStyles: Record<number, string> = {
    1: "ring-4 ring-amber-300 shadow-gold-glow",
    2: "ring-3 ring-gray-300",
    3: "ring-3 ring-amber-600/60",
  };

  const podiumColors: Record<number, string> = {
    1: "bg-amber-400",
    2: "bg-gray-300",
    3: "bg-amber-600/70",
  };

  return (
    <div className="min-h-screen bg-surface py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl text-brand-950 mb-2">Leaderboard</h1>
          <p className="text-brand-500">Top readers ranked by pages read</p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-card shadow-soft border border-brand-200">
            <p className="text-brand-500 text-lg">No readers yet. Be the first!</p>
          </div>
        ) : (
          <>
            {/* Podium — top 3 */}
            {top3.length > 0 && (
              <div className="flex items-end justify-center gap-4 mb-10 px-4">
                {podiumSlots.map(({ data: user, rank, height, size, textSize }) => {
                  if (!user) return null;
                  return (
                    <div key={user._id} className="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
                      {/* Avatar with rank badge */}
                      <div className="relative">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={rank === 1 ? 80 : 64}
                            height={rank === 1 ? 80 : 64}
                            className={`${size} rounded-full object-cover ${ringStyles[rank]}`}
                          />
                        ) : (
                          <div
                            className={`${size} bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center ${ringStyles[rank]}`}
                          >
                            <span className={`text-white font-bold ${textSize}`}>
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className={`rank-badge ${rankBadgeColors[rank] ?? "bg-brand-500"}`}>
                          {rank}
                        </div>
                      </div>

                      <p className="font-medium text-brand-950 text-sm text-center w-full truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-brand-500 font-medium">
                        {user.pagesRead?.toLocaleString() || 0}pts
                      </p>

                      {/* Podium block */}
                      <div
                        className={`w-full ${height} ${podiumColors[rank]} rounded-t-xl flex items-start justify-center pt-3`}
                      >
                        <span className="text-white font-bold text-lg">#{rank}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ranks 4+ — pill rows */}
            {rest.length > 0 && (
              <div className="space-y-2">
                {rest.map((user, i) => {
                  const rank = i + 4;
                  const isYou = user._id === currentUserId;
                  const trend = getTrend(rank - 1, leaderboard.length);

                  return (
                    <div
                      key={user._id}
                      className={`pill-row flex items-center gap-4 ${
                        isYou
                          ? "bg-brand-200/60 border border-brand-300"
                          : i % 2 === 0
                          ? "bg-brand-100"
                          : "bg-brand-50"
                      }`}
                    >
                      <div className="w-8 flex-shrink-0 text-center">
                        <span className="text-sm font-bold text-brand-400">#{rank}</span>
                      </div>

                      <div className="flex-shrink-0">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-brand-950 truncate text-sm">
                            {user.name}
                          </p>
                          {isYou && (
                            <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-brand-400">@{user.username}</p>
                      </div>

                      <div className="flex-shrink-0 w-5 text-center">
                        {trend === "up" && <span className="text-emerald-500 font-bold text-sm">↑</span>}
                        {trend === "down" && <span className="text-red-400 font-bold text-sm">↓</span>}
                        {trend === "neutral" && <span className="text-brand-300 text-sm">—</span>}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-brand-600 text-sm">
                          {user.pagesRead?.toLocaleString() || 0}pts
                        </p>
                        <p className="text-xs text-brand-400">{user.booksCompleted || 0} books</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
