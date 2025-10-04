import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models/User';

async function getLeaderboard() {
  await connectDB();
  return await User.find().sort({ pagesRead: -1 }).limit(100).lean();
}

export default async function LeaderboardPage() {
  const users = await getLeaderboard();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      
      <div className="space-y-2">
        {users.map((user: any, index: number) => (
          <div key={user._id.toString()} className="flex items-center gap-4 p-4 bg-white rounded shadow">
            <span className="text-2xl font-bold w-8">#{index + 1}</span>
            <div className="flex-1">
              <h3 className="font-semibold">{user.name}</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{user.pagesRead}</p>
              <p className="text-sm text-gray-600">pages</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}