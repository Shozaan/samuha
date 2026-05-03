import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Users,
    Shield,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    Button,
    Form,
    FormInput,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Label,
    Typography,
} from '@sujan77/ui-components';
import { useGlobalStore } from '../../../store/store';
import { useUsers, useAssignToGroup } from '../../Users/hooks/useUsers';
import { useGroupMembers } from '../hooks/useMembers';

const memberAssignmentSchema = z.object({
    userId: z.string().min(1, "Please select a user"),
    groupId: z.string().min(1, "Group is required"),
    role: z.enum(['ADMIN', 'SECONDARY_ADMIN', 'MEMBER']),
    relation: z.string().optional(),
});

type MemberAssignmentValues = z.infer<typeof memberAssignmentSchema>;

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
    const { activeGroup } = useGlobalStore();
    const { data: usersResponse, isLoading: isLoadingUsers } = useUsers({ limit: 100 });
    const { data: membersResponse, isLoading: isLoadingMembers } = useGroupMembers(activeGroup?.id || '');
    const assignToGroup = useAssignToGroup();

    const form = useForm<MemberAssignmentValues>({
        resolver: zodResolver(memberAssignmentSchema),
        defaultValues: {
            userId: '',
            groupId: activeGroup?.id || '',
            role: 'MEMBER',
            relation: '',
        },
    });

    const onSubmit = (values: MemberAssignmentValues) => {
        assignToGroup.mutate(values, {
            onSuccess: () => {
                onClose();
                form.reset();
            },
        });
    };

    const users = usersResponse?.data || [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-[2rem] overflow-hidden p-0 bg-card">
                <div className="bg-primary/5 p-8 border-b border-border">
                    <DialogHeader>
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-foreground">Add Group Member</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">
                            Select an existing user to add to <span className="text-primary font-bold">{activeGroup?.name || 'this group'}</span>.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                {/* User Selection */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Users className="w-3 h-3" /> Select User
                                    </Label>
                                    <Select
                                        onValueChange={(value) => form.setValue('userId', value)}
                                        defaultValue={form.getValues('userId')}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border focus:ring-4 focus:ring-primary/5 transition-all">
                                            <SelectValue placeholder={isLoadingUsers || isLoadingMembers ? "Loading users..." : "Choose a user..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => {
                                                const groupMembers = membersResponse?.data || [];
                                                const isMember = groupMembers.some(m => m.userId === user.id);
                                                
                                                return (
                                                <SelectItem key={user.id} value={user.id} disabled={isMember}>
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold ${isMember ? 'opacity-50' : ''}`}>{user.name} {isMember && '(Already in Group)'}</span>
                                                        <span className={`text-[10px] text-muted-foreground uppercase ${isMember ? 'opacity-50' : ''}`}>@{user.userName}</span>
                                                    </div>
                                                </SelectItem>
                                            )})}
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.userId && (
                                        <Typography variant="small" className="text-destructive text-[10px] font-bold uppercase tracking-tight">
                                            {form.formState.errors.userId.message}
                                        </Typography>
                                    )}
                                </div>

                                {/* Active Group (Disabled) */}
                                <div className="p-4 rounded-xl bg-muted/20 border border-muted-foreground/10 space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                                        Active Group (Target)
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center font-bold text-xs text-muted-foreground">
                                            G1
                                        </div>
                                        <Typography variant="p" className="font-bold text-muted-foreground">
                                            {activeGroup?.name || 'No Group Selected'}
                                        </Typography>
                                    </div>
                                    <input type="hidden" {...form.register('groupId')} value={activeGroup?.id || ''} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Role Selection */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Shield className="w-3 h-3" /> Role
                                        </Label>
                                        <Select
                                            onValueChange={(value) => form.setValue('role', value as any)}
                                            defaultValue={form.getValues('role')}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MEMBER">Member</SelectItem>
                                                <SelectItem value="SECONDARY_ADMIN">Sec. Admin</SelectItem>
                                                <SelectItem value="ADMIN">Group Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Relation (Optional) */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                            Relation
                                        </Label>
                                        <FormInput
                                            name="relation"
                                            placeholder="e.g. Brother"
                                            className="h-12 rounded-xl bg-muted/30 border-border"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                    className="flex-1 h-12 rounded-xl font-bold text-muted-foreground hover:bg-muted"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    disabled={assignToGroup.isPending}
                                >
                                    {assignToGroup.isPending ? "Assigning..." : "Assign User"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
