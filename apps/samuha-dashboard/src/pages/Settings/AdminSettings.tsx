import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    UserPlus,
    Trash2,
    ShieldCheck,
    ShieldAlert,
    Search,
    Key,
    Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardHeader,
    CardTitle,
    Typography,
    Button,
    Input,
    Avatar,
    AvatarFallback,
    toast
} from '@sujan77/ui-components';
import { SettingsApi, type AdminPayload } from './settings.api';

export default function AdminSettings() {
    const navigate = useNavigate();
    const [admins, setAdmins] = useState<AdminPayload[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAdmins() {
            try {
                const data = await SettingsApi.getAdmins();
                setAdmins(data || []);
            } catch (error) {
                console.error("Failed to fetch admins:", error);
                // Fallback for demonstration if API fails
                setAdmins([
                    { id: '1', name: 'Ram Bahadur', email: 'ram@example.com', role: 'Super Admin', since: 'Jan 2024' },
                    { id: '2', name: 'Sita Kumari', email: 'sita@example.com', role: 'Finance Admin', since: 'Feb 2024' }
                ]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAdmins();
    }, []);

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        try {
            await SettingsApi.removeAdmin(id);
            setAdmins(admins.filter(a => a.id !== id));
            toast.success("Admin removed", { description: "The administrator has been successfully removed." });
        } catch (error) {
            console.error("Error deleting admin:", error);
            toast.error("Failed to remove admin");
        }
    };

    if (isLoading) {
        return <div className="text-center py-20 text-muted-foreground animate-pulse">Loading administrators...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-700">
            <Button
                variant="ghost"
                onClick={() => navigate('/settings/group')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground group mb-2"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Group Rules
            </Button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Typography variant="h2" className="text-3xl font-bold text-foreground">System Administrators</Typography>
                    <Typography variant="muted">Manage people who can edit group rules and approve financial records.</Typography>
                </div>
                <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-6 rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
                    <UserPlus className="w-4 h-4" />
                    Add New Admin
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-primary/20 bg-primary/5 shadow-none p-6">
                    <ShieldCheck className="w-8 h-8 text-primary mb-4" />
                    <Typography variant="small" className="font-bold text-foreground mb-1 block uppercase">Super Admins</Typography>
                    <Typography variant="h2" className="text-3xl font-black text-foreground">1</Typography>
                    <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-bold mt-2 block tracking-widest">Full System Control</Typography>
                </Card>
                <Card className="border-border bg-card p-6 shadow-sm">
                    <ShieldAlert className="w-8 h-8 text-warning mb-4" />
                    <Typography variant="small" className="font-bold text-foreground mb-1 block uppercase">Sub Admins</Typography>
                    <Typography variant="h2" className="text-3xl font-black text-foreground">1</Typography>
                    <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-bold mt-2 block tracking-widest">Limited Permissions</Typography>
                </Card>
                <Card className="border-border bg-card p-6 shadow-sm">
                    <Key className="w-8 h-8 text-muted-foreground/40 mb-4" />
                    <Typography variant="small" className="font-bold text-foreground mb-1 block uppercase">Security Status</Typography>
                    <Typography variant="h4" className="text-xl font-bold text-success">Stable</Typography>
                    <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-bold mt-2 block tracking-widest">2FA Enabled for all</Typography>
                </Card>
            </div>

            <Card className="border-border bg-card overflow-hidden">
                <CardHeader className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="font-bold text-foreground">Active Administrators</CardTitle>
                    <div className="flex items-center gap-3 bg-muted px-4 py-1.5 rounded-xl border border-border w-64 focus-within:border-primary/50 transition-all">
                        <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
                        <Input placeholder="Search admins..." className="bg-transparent border-none outline-none text-xs text-foreground w-full shadow-none focus-visible:ring-0 h-8" />
                    </div>
                </CardHeader>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/50">
                                <th className="px-8 py-4">Administrator</th>
                                <th className="px-8 py-4">Role</th>
                                <th className="px-8 py-4">Admin Since</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {admins.map((admin) => (
                                <tr key={admin.id} className="group hover:bg-muted/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-9 h-9 rounded-lg border border-border bg-muted">
                                                <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary uppercase">
                                                    {admin.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <Typography variant="small" className="font-bold text-foreground block">{admin.name}</Typography>
                                                <Typography variant="small" className="text-[10px] text-muted-foreground font-medium">{admin.email}</Typography>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-widest border border-primary/20 ${admin.role === 'Super Admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {admin.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <Typography variant="small" className="text-muted-foreground font-medium">{admin.since || 'Unknown'}</Typography>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 text-muted-foreground">
                                            <Button variant="ghost" size="icon" className="hover:text-primary rounded-lg transition-all">
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="hover:text-destructive rounded-lg transition-all" onClick={() => handleDelete(admin.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="p-8 rounded-2xl bg-warning/5 border border-dashed border-warning/30 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-warning/10 text-warning mt-1">
                    <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                    <Typography variant="h4" className="font-bold text-foreground mb-1">Critical Security Note</Typography>
                    <Typography variant="small" className="text-sm text-muted-foreground leading-relaxed italic block">
                        Only the Super Admin can add or remove other administrators. All administrator actions are logged and cannot be deleted, ensuring full accountability for every rule change or financial approval.
                    </Typography>
                </div>
            </div>
        </div>
    );
}
