import apiInstance from '../../../api/apiInstance';
import type { User } from '../../../context/AuthContext';

export const authApi = {
    login: async (data: any): Promise<{ message: string; user: User }> => {
        const response = await apiInstance.post('/authenticate/login', data);
        return response.data;
    },
    register: async (data: any): Promise<{ message: string; user: User }> => {
        const response = await apiInstance.post('/authenticate/register', data);
        return response.data;
    }
};
