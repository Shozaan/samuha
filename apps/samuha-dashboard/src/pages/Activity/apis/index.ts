import apiInstance from '../../../api/apiInstance';

export const activitiesApi = {
    getAll: async (params?: { page?: number; limit?: number; groupId?: string; entityType?: string }) => {
        const res = await apiInstance.get('/activities', { params });
        return res.data;
    },
};
