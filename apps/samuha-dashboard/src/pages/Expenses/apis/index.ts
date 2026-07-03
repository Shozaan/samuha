import apiInstance from '../../../api/apiInstance';

export interface Expense {
    id: string;
    groupId: string;
    expenseType: string;
    amount: string;
    description: string;
    status: 'SUGGESTED' | 'APPROVED' | 'PAID' | 'REJECTED';
    suggestedById?: string;
    suggestedAt?: string;
    approvedById?: string;
    approvedAt?: string;
    paidDate?: string;
    paymentMode?: string;
    notes?: string;
    createdAt: string;
}

export interface CreateExpenseData {
    groupId: string;
    expenseType: string;
    amount: number;
    description: string;
    notes?: string;
    suggestedById?: string;
    suggestedAt?: string;
    status?: string;
}

export const expensesApi = {
    getAll: async (params?: { groupId?: string; status?: string; page?: number; limit?: number }) => {
        const res = await apiInstance.get('/expenses', { params });
        return res.data;
    },
    create: async (data: CreateExpenseData) => {
        const res = await apiInstance.post('/expenses', data);
        return res.data;
    },
    update: async (id: string, data: Partial<CreateExpenseData & { status: string }>) => {
        const res = await apiInstance.put(`/expenses/${id}`, data);
        return res.data;
    },
    delete: async (id: string) => {
        const res = await apiInstance.delete(`/expenses/${id}`);
        return res.data;
    },
};
