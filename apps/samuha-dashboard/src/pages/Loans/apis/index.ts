import apiInstance from '../../../api/apiInstance';
import type { LoanPostData, LoanUpdateData } from '../types';

export const loansApi = {
    getAllLoans: async (params?: { 
        page?: number; 
        limit?: number; 
        groupId?: string; 
        memberId?: string;
        status?: string;
    }) => {
        const response = await apiInstance.get('/loans', { params });
        return response.data;
    },

    getLoanById: async (id: string) => {
        const response = await apiInstance.get(`/loans/${id}`);
        return response.data;
    },

    createLoan: async (data: LoanPostData) => {
        const response = await apiInstance.post('/loans', data);
        return response.data;
    },

    updateLoan: async (id: string, data: LoanUpdateData) => {
        const response = await apiInstance.put(`/loans/${id}`, data);
        return response.data;
    },

    deleteLoan: async (id: string) => {
        const response = await apiInstance.delete(`/loans/${id}`);
        return response.data;
    },

    updateRepayment: async (id: string, data: any) => {
        const response = await apiInstance.put(`/loans/repayments/${id}`, data);
        return response.data;
    },

    getPendingRepayments: async (groupId: string) => {
        const response = await apiInstance.get('/loans/repayments/pending', { params: { groupId } });
        return response.data;
    },

    getMemberRepayments: async (memberId: string) => {
        const response = await apiInstance.get('/loans/repayments/member', { params: { memberId } });
        return response.data;
    },
};
