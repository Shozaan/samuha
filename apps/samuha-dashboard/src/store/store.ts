import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Group {
    id: string;
    name: string;
    description: string;
    status: string;
    closedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Membership {
    id: string;
    groupId: string;
    userId: string;
    relation: string;
    joinDate: string;
    exitDate: string | null;
    status: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    addedById: string | null;
    group: Group;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
    userName: string;
    role?: string;
    memberships: Membership[];
}

interface UserState {
    user: UserProfile | null;
    role: string | null;
    activeGroupId: string | null;
    activeGroup: Group | null;
    setUser: (user: UserProfile | null) => void;
    setActiveGroupId: (groupId: string | null) => void;
    clearUser: () => void;
    activeMemberId: string | null;
    setActiveMemberId: (memberId: string | null) => void;
}

export const useGlobalStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            role: null,
            activeGroupId: null,
            activeGroup: null,
            activeMemberId: null,
            setUser: (user) => {
                console.log('GlobalStore: setUser called with:', user);
                const currentActiveGroupId = get().activeGroupId;
                let nextActiveGroupId = currentActiveGroupId;

                // Sync activeGroupId if not set or if user changed
                if (user && user.memberships && user.memberships.length > 0) {
                    if (!currentActiveGroupId || !user.memberships.find(m => m.groupId === currentActiveGroupId)) {
                        nextActiveGroupId = user.memberships[0].groupId;
                    }
                } else {
                    nextActiveGroupId = null;
                }

                const activeMembership = user?.memberships?.find(m => m.groupId === nextActiveGroupId);

                // Derive role: Global Role > Membership Role
                const derivedRole = user?.role || activeMembership?.role || null;
                console.log('GlobalStore: Derived Role:', derivedRole, 'for Group:', nextActiveGroupId);

                set({
                    user,
                    role: derivedRole,
                    activeGroupId: nextActiveGroupId,
                    activeGroup: activeMembership?.group || null,
                    activeMemberId: activeMembership?.id || null
                });
            },
            setActiveGroupId: (groupId) => {
                console.log('GlobalStore: setActiveGroupId called with:', groupId);
                const user = get().user;
                const activeMembership = user?.memberships?.find(m => m.groupId === groupId);

                // Re-derive role for the new group context
                const derivedRole = user?.role || activeMembership?.role || null;
                console.log('GlobalStore: New Derived Role:', derivedRole, 'for Group:', groupId);

                set({
                    role: derivedRole,
                    activeGroupId: groupId,
                    activeGroup: activeMembership?.group || null,
                    activeMemberId: activeMembership?.id || null
                });
            },
            clearUser: () => {
                console.log('GlobalStore: clearUser called');
                set({ user: null, role: null, activeGroupId: null, activeGroup: null, activeMemberId: null });
            },
            setActiveMemberId: (memberId) => {
                console.log('GlobalStore: setActiveMemberId called with:', memberId);
                set({ activeMemberId: memberId });
            },
        }),
        {
            name: 'samuha-global-store', // Changing name to ensure fresh state if needed
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => {
                console.log('GlobalStore: Rehydration starting...');
                return (state, error) => {
                    if (error) {
                        console.error('GlobalStore: Hydration error:', error);
                    } else if (state && state.user) {
                        console.log('GlobalStore: Hydrated with user:', state.user.name);
                        // Re-derive the role immediately after hydration
                        const user = state.user;
                        const activeMembership = user.memberships?.find(m => m.groupId === state.activeGroupId);
                        const derivedRole = user.role || activeMembership?.role || null;

                        state.role = derivedRole;
                        if (activeMembership) {
                            state.activeGroup = activeMembership.group;
                            state.activeMemberId = activeMembership.id;
                        } else {
                            state.activeMemberId = null;
                        }
                    }
                };
            },
        }
    )
);
