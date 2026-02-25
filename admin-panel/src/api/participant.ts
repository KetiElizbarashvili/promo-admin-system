import api from './client';
import type { Participant } from '../types';

export const participantApi = {
  startRegistration: async (data: {
    firstName: string;
    lastName: string;
    govId: string;
    phone: string;
    email: string;
  }) => {
    const response = await api.post('/participants/register/start', data);
    return response.data;
  },

  verifyPhone: async (sessionId: string, code: string) => {
    const response = await api.post('/participants/register/verify-phone', {
      sessionId,
      code,
    });
    return response.data;
  },

  verifyEmail: async (sessionId: string, code: string) => {
    const response = await api.post('/participants/register/verify-email', {
      sessionId,
      code,
    });
    return response.data;
  },

  resendOTP: async (sessionId: string, type: 'phone' | 'email') => {
    const response = await api.post('/participants/register/resend-otp', {
      sessionId,
      type,
    });
    return response.data;
  },

  completeRegistration: async (sessionId: string, participantData: any) => {
    const response = await api.post('/participants/register/complete', {
      sessionId,
      ...participantData,
    });
    return response.data;
  },

  list: async (): Promise<Participant[]> => {
    const response = await api.get('/participants');
    return response.data.participants;
  },

  search: async (query: string): Promise<Participant[]> => {
    const response = await api.get('/participants/search', {
      params: { query },
    });
    return response.data.participants;
  },

  getByUniqueId: async (uniqueId: string): Promise<Participant> => {
    const response = await api.get(`/participants/${uniqueId}`);
    return response.data.participant;
  },

  addPoints: async (
    uniqueId: string,
    points: number,
    note?: string
  ): Promise<Participant> => {
    const response = await api.post(`/participants/${uniqueId}/add-points`, {
      points,
      note,
    });
    return response.data.participant;
  },

  lock: async (uniqueId: string, reason: string): Promise<void> => {
    await api.post(`/participants/${uniqueId}/lock`, { reason });
  },

  unlock: async (uniqueId: string): Promise<void> => {
    await api.post(`/participants/${uniqueId}/unlock`);
  },
};
