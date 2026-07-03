import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loansApi } from '../apis';
import type { LoanPostData, LoanUpdateData } from '../types';
import { toast } from '@sujan77/ui-components';
import { type AxiosError } from 'axios';
import { useGlobalStore } from '../../../store/store';

// Build actor from global store for activity logging
const useActor = () => {
    const { user, activeMemberId, role } = useGlobalStore();
    if (!activeMemberId || !user?.name) return undefined;
    return { id: activeMemberId, name: user.name, role: role || 'MEMBER' };
};

export const useLoans = (params?: {
    page?: number;
    limit?: number;
    groupId?: string;
    memberId?: string;
    status?: string;
}) => {
    return useQuery({
        queryKey: ['loans', params],
        queryFn: () => loansApi.getAllLoans(params),
        keepPreviousData: true,
    });
};

export const useLoanById = (id?: string) => {
    return useQuery({
        queryKey: ['loans', id],
        queryFn: () => id ? loansApi.getLoanById(id) : Promise.reject("No ID provided"),
        enabled: !!id,
    });
};

export const useCreateLoan = () => {
    const queryClient = useQueryClient();
    const actor = useActor();

    return useMutation({
        mutationFn: (data: LoanPostData) => loansApi.createLoan({ ...data, actor }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            toast.success("Loan requested successfully");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            const message = error.response?.data?.message || "Failed to request loan";
            toast.error(message);
        }
    });
};

export const useUpdateLoan = () => {
    const queryClient = useQueryClient();
    const actor = useActor();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: LoanUpdateData }) =>
            loansApi.updateLoan(id, { ...data, actor }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            toast.success("Loan updated successfully");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            const message = error.response?.data?.message || "Failed to update loan";
            toast.error(message);
        }
    });
};

export const usePendingRepayments = (groupId?: string) =>
    useQuery({
        queryKey: ['repayments', 'pending', groupId],
        queryFn: () => loansApi.getPendingRepayments(groupId!),
        enabled: !!groupId,
    });

export const useMemberRepayments = (memberId?: string) =>
    useQuery({
        queryKey: ['repayments', 'member', memberId],
        queryFn: () => loansApi.getMemberRepayments(memberId!),
        enabled: !!memberId,
    });

export const useUpdateRepayment = () => {
    const queryClient = useQueryClient();
    const actor = useActor();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            loansApi.updateRepayment(id, { ...data, actor }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            toast.success("Repayment marked as paid successfully");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            const message = error.response?.data?.message || "Failed to update repayment";
            toast.error(message);
        }
    });
};
