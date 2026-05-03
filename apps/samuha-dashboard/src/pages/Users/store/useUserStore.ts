import { create } from 'zustand';
import type { UserStore } from '../types';



export const useUserStore = create<UserStore>((set) => ({
    filters: {
        search: '',
        status: 'all',
        role: 'all',
    },
    page: 1,
    setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters },
        page: 1 // Reset page on filter change
    })),
    setPage: (page) => set({ page }),
    resetFilters: () => set({
        filters: { search: '', status: 'all', role: 'all' },
        page: 1
    }),
}));
