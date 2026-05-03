import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    UserPlus,
    Filter,
    ChevronRight,
    Download
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    Input,
    Button,
    Avatar,
    AvatarFallback,
    Typography
} from '@sujan77/ui-components';

import { AddUserModal } from './components/UserModal';
import type { UserData } from './types';
import { useCreateUser, useUsers } from './hooks/useUsers';
import { useUserStore } from './store/useUserStore';
import { useGlobalStore } from '../../store/store';

export default function UsersList() {
    const navigate = useNavigate();
    const { role } = useGlobalStore();
    const isAdmin = role?.toUpperCase() === 'ADMIN';
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    console.log(role);
    const { page, filters, setFilters } = useUserStore();
    const { data: usersResponse, isLoading } = useUsers({ page, limit: 10, search: filters.search });
    const createUser = useCreateUser();
    const users = usersResponse?.data || [];

    const handleAddUser = (userData: UserData) => {
        createUser.mutate(userData, {
            onSuccess: () => {
                setIsAddModalOpen(false);
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Typography variant="h2" className="text-3xl font-bold text-foreground">Global Registry</Typography>
                    <Typography variant="muted">Manage and view all registered users in the system.</Typography>
                </div>
                {isAdmin && (
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md animate-in zoom-in duration-300"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add New User
                    </Button>
                )}
            </div>

            <Card className="border-border bg-card">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border">
                    <div className="flex items-center gap-4 bg-muted px-4 py-1.5 rounded-xl border border-border w-full md:w-96 focus-within:border-primary/50 transition-all">
                        <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
                        <Input
                            value={filters.search}
                            onChange={(e) => setFilters({ search: e.target.value })}
                            placeholder="Search by name, username or ID..."
                            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0"
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex items-center gap-2 rounded-xl text-muted-foreground hover:text-foreground">
                            <Filter className="w-4 h-4" />
                            Filter
                        </Button>
                        {isAdmin && (
                            <Button variant="ghost" className="text-primary hover:text-primary/80 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export List
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading users...</div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className=" md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="border-b border-border text-xs text-muted-foreground font-medium bg-muted/50 uppercase tracking-wider">
                                            <th className="px-8 py-4">User</th>
                                            <th className="px-8 py-4 text-left">Total Deposits</th>
                                            <th className="px-8 py-4 text-left">Join Date</th>
                                            <th className="px-8 py-4 text-center">Status</th>
                                            <th className="px-8 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {users.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-muted/30 transition-all cursor-pointer group"
                                                onClick={() => navigate(`/users/${user.id}`)}
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="w-10 h-10 border-2 border-primary/20 bg-muted group-hover:scale-110 transition-transform">
                                                            <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary uppercase">
                                                                {user.name.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <Typography variant="p" className="font-bold text-foreground group-hover:text-primary transition-colors">{user.name}</Typography>
                                                            <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">ID: #SM-00{user.id}</Typography>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <Typography variant="p" className="font-black text-foreground">NPR {user.deposits || '0'}</Typography>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <Typography variant="small" className="text-muted-foreground">{user.joinDate || 'N/A'}</Typography>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest ${(!user.status || user.status === 'Active') ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                                                        }`}>
                                                        {user.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-xl">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="block md:hidden divide-y divide-border">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="p-4 bg-card active:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/users/${user.id}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Avatar className="w-12 h-12 border-2 border-primary/20 bg-muted">
                                                <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary uppercase">
                                                    {user.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <Typography variant="p" className="font-bold text-foreground">{user.name}</Typography>
                                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${(!user.status || user.status === 'Active') ? 'bg-success/11 text-success' : 'bg-muted text-muted-foreground'
                                                        }`}>
                                                        {user.status || 'Active'}
                                                    </span>
                                                </div>
                                                <Typography variant="small" className="text-muted-foreground text-[11px] font-medium">ID: #SM-00{user.id}</Typography>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddUser={handleAddUser}
            />
        </div>
    );
}
