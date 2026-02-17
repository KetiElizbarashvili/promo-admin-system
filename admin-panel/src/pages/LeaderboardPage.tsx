import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { adminApi } from '../api/admin';
import type { LeaderboardEntry } from '../types';
import { Trophy, Medal } from 'lucide-react';

export function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getLeaderboard(100);
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50';
    if (rank === 2) return 'bg-gray-50';
    if (rank === 3) return 'bg-orange-50';
    return 'bg-white';
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leaderboard</h1>
          <button onClick={loadLeaderboard} className="btn btn-secondary text-xs sm:text-sm px-3 sm:px-4">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        ) : (
          <div className="card overflow-hidden p-0 sm:p-6">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-gray-500 p-6">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">No participants yet</p>
              </div>
            ) : (
              <>
                {/* Mobile view - Card layout */}
                <div className="block sm:hidden divide-y divide-gray-200">
                  {leaderboard.map((entry) => (
                    <div key={entry.uniqueId} className={`p-4 ${getRankBg(entry.rank)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {entry.rank <= 3 && (
                            <Medal className={`w-5 h-5 ${getRankColor(entry.rank)}`} />
                          )}
                          <span className={`font-bold text-lg ${getRankColor(entry.rank)}`}>
                            #{entry.rank}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-red-600">
                            {entry.totalPoints}
                          </div>
                          <div className="text-xs text-gray-500">total pts</div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900 text-sm">
                          {entry.firstName} {entry.lastName}
                        </div>
                        <div className="font-mono text-xs text-gray-600">
                          {entry.uniqueId}
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          {entry.activePoints} active points
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop view - Table layout */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unique ID
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Points
                        </th>
                        <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Active Points
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leaderboard.map((entry) => (
                        <tr key={entry.uniqueId} className={`${getRankBg(entry.rank)} hover:bg-gray-50 transition-colors`}>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {entry.rank <= 3 ? (
                                <Medal className={`w-5 h-5 ${getRankColor(entry.rank)}`} />
                              ) : null}
                              <span className={`font-semibold ${getRankColor(entry.rank)}`}>
                                #{entry.rank}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-xs sm:text-sm font-medium text-gray-900">
                              {entry.uniqueId}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {entry.firstName} {entry.lastName}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-base md:text-lg font-bold text-red-600">
                              {entry.totalPoints}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-medium text-green-600">
                              {entry.activePoints}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
