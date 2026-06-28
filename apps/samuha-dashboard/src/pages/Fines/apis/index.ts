import apiInstance from '../../../api/apiInstance';

const BASE = '/fines';

export const finesApi = {
    getByGroup: async (groupId: string) => {
        const res = await apiInstance.get(`${BASE}/group/${groupId}`);
        return res.data;
    },
    getByMember: async (memberId: string) => {
        const res = await apiInstance.get(`${BASE}/member/${memberId}`);
        return res.data;
    },
    create: async (data: any) => {
        const res = await apiInstance.post(`${BASE}`, data);
        return res.data;
    },
    markPaid: async (fineId: string, paymentMode: string, virtualDetails?: any) => {
        const res = await apiInstance.put(`${BASE}/${fineId}/pay`, { paymentMode, virtualDetails });
        return res.data;
    },
    waive: async (fineId: string, waivedBy: string, reason: string) => {
        const res = await apiInstance.put(`${BASE}/${fineId}/waive`, { waivedBy, reason });
        return res.data;
    },
    runEngine: async () => {
        const res = await apiInstance.post(`${BASE}/run-engine`, {});
        return res.data;
    },
};
