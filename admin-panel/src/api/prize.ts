import api from './client';
import type { Prize } from '../types';

export const prizeApi = {
  getAll: async (): Promise<Prize[]> => {
    const response = await api.get('/prizes');
    return response.data.prizes;
  },

  getActive: async (): Promise<Prize[]> => {
    const response = await api.get('/prizes/active');
    return response.data.prizes;
  },

  getById: async (id: number): Promise<Prize> => {
    const response = await api.get(`/prizes/${id}`);
    return response.data.prize;
  },

  create: async (data: {
    name: string;
    imageUrl?: string | null;
    costPoints: number;
    stockQty?: number | null;
  }): Promise<Prize> => {
    const response = await api.post('/prizes', data);
    return response.data.prize;
  },

  update: async (
    id: number,
    data: Partial<{
      name: string;
      imageUrl: string | null;
      costPoints: number;
      stockQty: number | null;
      status: 'ACTIVE' | 'INACTIVE';
    }>
  ): Promise<Prize> => {
    const response = await api.put(`/prizes/${id}`, data);
    return response.data.prize;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/prizes/${id}`);
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/prizes/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.imageUrl as string;
  },

  redeem: async (uniqueId: string, prizeId: number): Promise<void> => {
    await api.post('/prizes/redeem', { uniqueId, prizeId });
  },
};
