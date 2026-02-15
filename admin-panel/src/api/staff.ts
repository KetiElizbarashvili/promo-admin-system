import api from './client';
import type { StaffMember } from '../types';

export const staffApi = {
  getAll: async (): Promise<StaffMember[]> => {
    const response = await api.get('/staff');
    return response.data.staff;
  },

  create: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    role: 'SUPER_ADMIN' | 'STAFF';
  }) => {
    const response = await api.post('/staff', data);
    return response.data;
  },

  verifyEmail: async (email: string, code: string) => {
    const response = await api.post('/staff/verify-email', { email, code });
    return response.data;
  },

  completeRegistration: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    role: 'SUPER_ADMIN' | 'STAFF';
  }) => {
    const response = await api.post('/staff/complete-registration', data);
    return response.data;
  },

  resendCode: async (email: string) => {
    const response = await api.post('/staff/resend-code', { email });
    return response.data;
  },

  resetPassword: async (staffId: number): Promise<void> => {
    await api.post('/staff/reset-password', { staffId });
  },
};
