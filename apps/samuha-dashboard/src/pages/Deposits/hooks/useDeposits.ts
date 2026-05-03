import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { depositsApi } from '../apis';
import type { DepositPostData } from '../types';
import { toast } from '@sujan77/ui-components';
import { type AxiosError } from 'axios';

export const useDeposits = (params?: {
    page?: number;
    limit?: number;
    groupId?: string;
    memberId?: string;
    status?: string;
    monthYear?: string
}) => {
    return useQuery({
        queryKey: ['deposits', params],
        queryFn: () => depositsApi.getAllDeposits(params),
        keepPreviousData: true,
    });
};

export const useCreateDeposit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: DepositPostData) => depositsApi.createDeposit(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deposits'] });
            toast.success("Deposit recorded successfully");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            const message = error.response?.data?.message || "Failed to record deposit";
            toast.error(message);
        }
    });
};

export const useUpdateDeposit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<DepositPostData> }) => depositsApi.updateDeposit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deposits'] });
            toast.success("Deposit updated successfully");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            const message = error.response?.data?.message || "Failed to update deposit";
            toast.error(message);
        }
    });
};

export const useDeleteDeposit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => depositsApi.deleteDeposit(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deposits'] });
            toast.success("Deposit deleted successfully");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            const message = error.response?.data?.message || "Failed to delete deposit";
            toast.error(message);
        }
    });
};
