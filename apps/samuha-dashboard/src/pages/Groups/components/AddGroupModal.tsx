import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Users,
    FileText,
    Info,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    Button,
    FormInput,
    Form,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Label,
} from '@sujan77/ui-components';
import { groupSchema, type GroupFormData } from '../types';

interface AddGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: GroupFormData) => void;
    initialData?: Partial<GroupFormData> | null;
    mode?: 'add' | 'edit';
}

export function AddGroupModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode = 'add'
}: AddGroupModalProps) {
    const isEditing = mode === 'edit';

    const form = useForm<GroupFormData>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            name: '',
            description: '',
            status: 'ACTIVE',
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                form.reset({
                    name: initialData.name || '',
                    description: initialData.description || '',
                    status: initialData.status || 'ACTIVE',
                });
            } else if (!isEditing) {
                form.reset({
                    name: '',
                    description: '',
                    status: 'ACTIVE',
                });
            }
        }
    }, [isOpen, isEditing, initialData, form]);

    const handleFormSubmit = (values: GroupFormData) => {
        onSubmit(values);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] border-none bg-card p-0 overflow-hidden rounded-3xl shadow-2xl">
                <div className="bg-primary/10 p-8 pb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />

                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black text-foreground">
                            {isEditing ? 'Edit Group' : 'Create New Group'}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">
                            {isEditing ? 'Update the details of your family group.' : 'Start a new family group to manage collective funds.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 -mt-6 bg-card rounded-t-[2.5rem] relative z-20">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <Users className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Group Name</Label>
                                    </div>
                                    <FormInput
                                        name="name"
                                        placeholder="e.g., Sharma Family Fund"
                                        className="h-11 rounded-xl bg-muted/30 border-border"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <FileText className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Description</Label>
                                    </div>
                                    <FormInput
                                        name="description"
                                        placeholder="Collective savings for family welfare..."
                                        className="h-11 rounded-xl bg-muted/30 border-border"
                                    />
                                </div>

                                {isEditing && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                            <Info className="w-3.5 h-3.5" />
                                            <Label className="text-[10px] font-bold uppercase tracking-wider">Status</Label>
                                        </div>
                                        <Select
                                            value={form.watch('status')}
                                            onValueChange={(val: 'ACTIVE' | 'CLOSED' | 'ARCHIVED') => form.setValue('status', val)}
                                        >
                                            <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-border">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ACTIVE">Active</SelectItem>
                                                <SelectItem value="CLOSED">Closed</SelectItem>
                                                <SelectItem value="ARCHIVED">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 flex justify-end gap-3">
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
                                    className="rounded-xl px-8 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                                >
                                    {isEditing ? 'Update Group' : 'Create Group'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
