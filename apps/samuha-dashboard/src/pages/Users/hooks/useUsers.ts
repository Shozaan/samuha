import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@sujan77/ui-components';
import { type AxiosError } from 'axios';
import { usersApi } from '../apis';
import type { AssignmentData, UserData } from '../types';

export const useUsers = (params?: { page?: number; limit?: number; search?: string }) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: () => usersApi.getAllUsers(params),
        keepPreviousData: true,
    });
};

export const useUser = (id: string) => {
    return useQuery({
        queryKey: ['users', id],
        queryFn: () => usersApi.getUserById(id),
        enabled: !!id,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UserData) => usersApi.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success("User created successfully");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            const message = error.response?.data?.message || "Failed to create member";
            toast.error(message);
        }
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<UserData> }) => usersApi.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            toast.success("Member updated successfully");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            const message = error.response?.data?.message || "Failed to update member";
            toast.error(message);
        }
    });
};

export const useAssignToGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AssignmentData) => usersApi.assignToGroup(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            toast.success("User assigned to group successfully");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            const message = error.response?.data?.message || "Failed to assign user to group";
            toast.error(message);
        }
    });
};
