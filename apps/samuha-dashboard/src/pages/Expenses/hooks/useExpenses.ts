import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi, type CreateExpenseData } from '../apis';
import { toast } from '@sujan77/ui-components';
import { type AxiosError } from 'axios';
import { useGlobalStore } from '../../../store/store';

const useActor = () => {
    const { user, activeMemberId, role } = useGlobalStore();
    if (!activeMemberId || !user?.name) return undefined;
    return { id: activeMemberId, name: user.name, role: role || 'MEMBER' };
};

export const useExpenses = (params?: { groupId?: string; status?: string; page?: number; limit?: number }) =>
    useQuery({
        queryKey: ['expenses', params],
        queryFn: () => expensesApi.getAll(params),
        enabled: !!params?.groupId,
    });

export const useCreateExpense = () => {
    const queryClient = useQueryClient();
    const actor = useActor();

    return useMutation({
        mutationFn: (data: CreateExpenseData) => expensesApi.create({ ...data, actor } as any),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            toast.success('Expense logged successfully');
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || 'Failed to log expense');
        },
    });
};

export const useUpdateExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateExpenseData & { status: string }> }) =>
            expensesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success('Expense updated');
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || 'Failed to update expense');
        },
    });
};

export const useDeleteExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => expensesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success('Expense deleted');
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error('Failed to delete expense');
        },
    });
};
