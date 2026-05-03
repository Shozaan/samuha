import apiInstance from '../../../api/apiInstance';
import type { DepositPostData, DepositUpdateData } from '../types';

export interface DepositResponse {
    id: string;
    groupId: string;
    memberId: string;
    monthYear: string;
    amount: string;
    dueDate: string;
    status: 'PENDING' | 'PAID' | 'LATE' | 'WAIVED';
    paidDate?: string;
    paymentMode?: 'CASH' | 'BANK_TRANSFER' | 'CHECK';
    fineAmount: string;
    fineId?: string;
    voucherUrl?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    member?: {
        name: string;
    };
}

export interface PaginatedDepositsResponse {
    success: boolean;
    message: string;
    data: DepositResponse[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const depositsApi = {
    getAllDeposits: async (params?: {
        page?: number;
        limit?: number;
        groupId?: string;
        memberId?: string;
        status?: string;
        monthYear?: string
    }): Promise<PaginatedDepositsResponse> => {
        const response = await apiInstance.get('/deposits', { params });
        return response.data;
    },

    getDepositById: async (id: string): Promise<{ success: boolean; data: DepositResponse }> => {
        const response = await apiInstance.get(`/deposits/${id}`);
        return response.data;
    },

    createDeposit: async (data: DepositPostData): Promise<{ success: boolean; data: DepositResponse }> => {
        const response = await apiInstance.post('/deposits', data);
        return response.data;
    },

    updateDeposit: async (id: string, data: DepositUpdateData): Promise<{ success: boolean; data: DepositResponse }> => {
        const response = await apiInstance.put(`/deposits/${id}`, data);
        return response.data;
    },

    deleteDeposit: async (id: string): Promise<{ success: boolean }> => {
        const response = await apiInstance.delete(`/deposits/${id}`);
        return response.data;
    }
};
