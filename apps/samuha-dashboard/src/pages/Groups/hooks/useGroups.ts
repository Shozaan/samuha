import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../apis';
import type { GroupFormData } from '../types';
import { toast } from '@sujan77/ui-components';
import { type AxiosError } from 'axios';

export const useGroups = (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}) => {
    return useQuery({
        queryKey: ['groups', params],
        queryFn: () => groupsApi.getAllGroups(params),
        keepPreviousData: true,
    });
};

export const useGroup = (id: string) => {
    return useQuery({
        queryKey: ['groups', id],
        queryFn: () => groupsApi.getGroupById(id),
        enabled: !!id,
    });
};

export const useCreateGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: GroupFormData) => groupsApi.createGroup(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success("Group created successfully");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            const message = error.response?.data?.message || "Failed to create group";
            toast.error(message);
        }
    });
};

export const useUpdateGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<GroupFormData> }) => groupsApi.updateGroup(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success("Group updated successfully");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            const message = error.response?.data?.message || "Failed to update group";
            toast.error(message);
        }
    });
};
