import z from "zod";

export const groupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'CLOSED', 'ARCHIVED']),
});

export type GroupFormData = z.infer<typeof groupSchema>;

export interface GroupResponse {
    id: string;
    name: string;
    description?: string;
    status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
    createdAt: string;
    updatedAt: string;
    _count?: {
        members: number;
    }
}

export interface PaginatedGroupsResponse {
    success: boolean;
    message: string;
    data: GroupResponse[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
