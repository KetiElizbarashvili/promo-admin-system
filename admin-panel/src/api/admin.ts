import api from './client';
import type { LeaderboardEntry, TransactionLog } from '../types';

export const adminApi = {
  getLeaderboard: async (
    limit: number = 100,
    offset: number = 0
  ): Promise<LeaderboardEntry[]> => {
    const response = await api.get('/admin/leaderboard', {
      params: { limit, offset },
    });
    return response.data.leaderboard;
  },

  getLogs: async (filters?: {
    type?: string;
    participantId?: number;
    staffUserId?: number;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<TransactionLog[]> => {
    const response = await api.get('/admin/logs', { params: filters });
    return response.data.logs;
  },
};
