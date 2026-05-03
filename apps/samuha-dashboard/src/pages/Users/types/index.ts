import z from "zod";

export const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
    email: z.string().email("Invalid email address"),
    userName: z.string().min(3, "Username must be at least 3 characters"),
});

export type UserData = z.infer<typeof userSchema>;

export interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddUser?: (userData: UserData) => void;
    onUpdateUser?: (userData: UserData) => void;
    initialData?: UserData | null;
    mode?: 'add' | 'edit';
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    userName: string;
    status?: string;
    joinDate?: string;
    deposits?: string;
}

export interface AssignmentData {
    userId: string;
    groupId: string;
    relation?: string;
    role?: 'ADMIN' | 'SECONDARY_ADMIN' | 'MEMBER';
    status?: 'ACTIVE' | 'INACTIVE' | 'EXITED';
}

export interface PaginatedUsersResponse {
    success: boolean;
    message: string;
    data: UserResponse[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export interface UserFilters {
    search: string;
    status: string;
    role: string;
}

export interface UserStore {
    filters: UserFilters;
    page: number;
    setFilters: (filters: Partial<UserFilters>) => void;
    setPage: (page: number) => void;
    resetFilters: () => void;
}