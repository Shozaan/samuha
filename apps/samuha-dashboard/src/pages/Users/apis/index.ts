import apiInstance from '../../../api/apiInstance';
import type { AssignmentData, PaginatedUsersResponse, UserData, UserResponse } from '../types';


export const usersApi = {
    getAllUsers: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedUsersResponse> => {
        const response = await apiInstance.get('/users', { params });
        return response.data;
    },

    getUserById: async (id: string): Promise<{ success: boolean; data: UserResponse }> => {
        const response = await apiInstance.get(`/users/${id}`);
        return response.data;
    },

    createUser: async (data: UserData): Promise<{ success: boolean; data: UserResponse }> => {
        // Backend currently expects password. We'll pass a default or generate one if needed. (Assuming AddMemberModal does not ask for it)
        const payload = {
            ...data,
            password: 'defaultPassword123!', // Required by backend API for now
        };
        const response = await apiInstance.post('/users', payload);
        return response.data;
    },

    updateUser: async (id: string, data: Partial<UserData>): Promise<{ success: boolean; data: UserResponse }> => {
        const response = await apiInstance.put(`/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: string): Promise<{ success: boolean }> => {
        const response = await apiInstance.delete(`/users/${id}`);
        return response.data;
    },

    assignToGroup: async (data: AssignmentData): Promise<{ success: boolean; data: any }> => {
        const response = await apiInstance.post('/members', data);
        return response.data;
    }
};
