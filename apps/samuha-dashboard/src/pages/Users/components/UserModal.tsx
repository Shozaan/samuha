import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    User,
    Phone,
    Mail,
    UserCircle,
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
    Label,
} from '@sujan77/ui-components';
import { type AddUserModalProps, type UserData, userSchema } from '../types';



export function AddUserModal({
    isOpen,
    onClose,
    onAddUser,
    onUpdateUser,
    initialData,
    mode = 'add'
}: AddUserModalProps) {
    const isEditing = mode === 'edit';

    const form = useForm<UserData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: '',
            phoneNumber: '',
            email: '',
            userName: '',
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                form.reset(initialData);
            } else if (!isEditing) {
                form.reset({
                    name: '',
                    phoneNumber: '',
                    email: '',
                    userName: '',
                });
            }
        }
    }, [isOpen, isEditing, initialData, form]);

    const onSubmit = (values: UserData) => {
        if (isEditing && onUpdateUser) {
            onUpdateUser(values);
        } else if (onAddUser) {
            onAddUser(values);
        }
        form.reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] border-none bg-card p-0 overflow-hidden rounded-3xl shadow-2xl">
                <div className="bg-primary/10 p-8 pb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />

                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black text-foreground">{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">
                            {isEditing ? 'Update the user profile details below.' : 'Create a new global user account.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 -mt-6 bg-card rounded-t-[2.5rem] relative z-20">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <User className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Full Name</Label>
                                    </div>
                                    <FormInput
                                        name="name"
                                        placeholder="Enter full name"
                                        className="h-11 rounded-xl bg-muted/30 border-border focus:ring-primary/20 transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <UserCircle className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Username</Label>
                                    </div>
                                    <FormInput
                                        name="userName"
                                        placeholder="Choose username"
                                        className="h-11 rounded-xl bg-muted/30 border-border focus:ring-primary/20 transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <Phone className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Phone Number</Label>
                                    </div>
                                    <FormInput
                                        name="phoneNumber"
                                        placeholder="Enter phone number"
                                        className="h-11 rounded-xl bg-muted/30 border-border focus:ring-primary/20 transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1 ml-1 text-muted-foreground">
                                        <Mail className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase tracking-wider">Email Address</Label>
                                    </div>
                                    <FormInput
                                        name="email"
                                        type="email"
                                        placeholder="Enter email address"
                                        className="h-11 rounded-xl bg-muted/30 border-border focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                    className="rounded-xl px-6 font-bold text-muted-foreground hover:bg-muted"
                                >
                                    Discard
                                </Button>
                                <Button
                                    type="submit"
                                    className="rounded-xl px-8 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                                >
                                    {isEditing ? 'Update User' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
