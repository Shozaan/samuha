import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
    Shield,
    Users,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    Button,
    Form,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Label,
    FormInput,
} from '@sujan77/ui-components';
import { useGroups } from '../../Groups/hooks/useGroups';
import type { AssignmentData } from '../types';
import { useUserMemberships } from '../../Members/hooks/useMembers';

const assignmentSchema = z.object({
    groupId: z.string().min(1, "Group selection is required"),
    role: z.enum(['ADMIN', 'SECONDARY_ADMIN', 'MEMBER']),
    relation: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'EXITED']),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface AssignToGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<AssignmentData, 'userId'>) => void;
    userName: string;
    userId: string;
}

export function AssignToGroupModal({
    isOpen,
    onClose,
    onSubmit,
    userName,
    userId
}: AssignToGroupModalProps) {
    const { data: groupsResponse } = useGroups({ limit: 100 });
    const { data: userMembershipsResponse, isLoading: isLoadingUserMemberships } = useUserMemberships(userId);
    const groups = groupsResponse?.data || [];

    const form = useForm<AssignmentFormData>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            groupId: '',
            role: 'MEMBER',
            relation: '',
            status: 'ACTIVE',
        }
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                groupId: '',
                role: 'MEMBER',
                relation: '',
                status: 'ACTIVE',
            });
        }
    }, [isOpen, form]);

    const handleFormSubmit = (values: AssignmentFormData) => {
        onSubmit(values);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] border-none bg-card p-0 overflow-hidden rounded-3xl shadow-2xl">
                <div className="bg-primary/10 p-8 pb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />

                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black text-foreground">Assign to Group</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">
                            Add <span className="text-primary font-bold">{userName}</span> to a family group pool.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 -mt-6 bg-card rounded-t-[2.5rem] relative z-20">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <Shield className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Select Group</Label>
                                    </div>
                                    <Select
                                        value={form.watch('groupId')}
                                        onValueChange={(val) => form.setValue('groupId', val)}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-border">
                                            <SelectValue placeholder={isLoadingUserMemberships ? "Loading groups..." : "Choose a group..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map((g) => {
                                                const userMemberships = userMembershipsResponse?.data || [];
                                                const isMember = userMemberships.some((m: any) => m.groupId === g.id);
                                                return (
                                                <SelectItem key={g.id} value={g.id} disabled={isMember}>
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold ${isMember ? 'opacity-50' : ''}`}>{g.name} {isMember && '(Already Joined)'}</span>
                                                    </div>
                                                </SelectItem>
                                            )})}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <Users className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Group Role</Label>
                                    </div>
                                    <Select
                                        value={form.watch('role')}
                                        onValueChange={(val: 'ADMIN' | 'SECONDARY_ADMIN' | 'MEMBER') => form.setValue('role', val)}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-border">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MEMBER">Member</SelectItem>
                                            <SelectItem value="SECONDARY_ADMIN">Assistant Admin</SelectItem>
                                            <SelectItem value="ADMIN">Group Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Relationship (Optional)</Label>
                                    </div>
                                    <FormInput
                                        name="relation"
                                        placeholder="e.g., Brother, Cousin..."
                                        className="h-11 rounded-xl bg-muted/30 border-border"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                    className="rounded-xl px-6 font-bold text-muted-foreground"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!form.watch('groupId')}
                                    className="rounded-xl px-8 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                                >
                                    Confirm Assignment
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
