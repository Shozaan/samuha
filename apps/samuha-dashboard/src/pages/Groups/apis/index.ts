import apiInstance from '../../../api/apiInstance';
import type { GroupResponse, PaginatedGroupsResponse, GroupFormData } from '../types';

export const groupsApi = {
    getAllGroups: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    }): Promise<PaginatedGroupsResponse> => {
        const response = await apiInstance.get('/groups', { params });
        return response.data;
    },

    getGroupById: async (id: string): Promise<{ success: boolean; data: GroupResponse }> => {
        const response = await apiInstance.get(`/groups/${id}`);
        return response.data;
    },

    createGroup: async (data: GroupFormData): Promise<{ success: boolean; data: GroupResponse }> => {
        const response = await apiInstance.post('/groups', data);
        return response.data;
    },

    updateGroup: async (id: string, data: Partial<GroupFormData>): Promise<{ success: boolean; data: GroupResponse }> => {
        const response = await apiInstance.put(`/groups/${id}`, data);
        return response.data;
    },

    deleteGroup: async (id: string): Promise<{ success: boolean }> => {
        const response = await apiInstance.delete(`/groups/${id}`);
        return response.data;
    }
};
