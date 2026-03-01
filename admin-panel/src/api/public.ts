import api from './client';
import type { LeaderboardEntry } from '../types';

interface PublicLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}

interface PublicSearchResponse {
  participant: LeaderboardEntry;
}

export const publicApi = {
  getLeaderboard: async (limit = 50): Promise<LeaderboardEntry[]> => {
    const response = await api.get<PublicLeaderboardResponse>('/public/leaderboard', {
      params: { limit },
    });
    return response.data.leaderboard;
  },

  searchByUniqueId: async (uniqueId: string): Promise<LeaderboardEntry | null> => {
    try {
      const response = await api.get<PublicSearchResponse>(`/public/search/${encodeURIComponent(uniqueId)}`);
      return response.data.participant;
    } catch {
      return null;
    }
  },
};
