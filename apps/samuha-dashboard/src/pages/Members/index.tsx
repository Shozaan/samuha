import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Shield,
    Mail,
    Phone,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    Input,
    Avatar,
    AvatarFallback,
    Typography,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@sujan77/ui-components';
import { useMyMemberships, useGroupMembers } from './hooks/useMembers';
import { useGlobalStore } from '../../store/store';
import { AddMemberModal } from './components/AddMemberModal';
import { UserPlus } from 'lucide-react';
import { Button } from '@sujan77/ui-components';

export default function MembersList() {
    const navigate = useNavigate();
    const { activeGroupId, setActiveGroupId, role, user: currentUser } = useGlobalStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    console.log(role)

    const { memberships, isLoading: isMembershipsLoading } = useMyMemberships();

    const { data: membersResponse, isLoading: isMembersLoading } = useGroupMembers(activeGroupId || '');
    const members = membersResponse?.data || [];

    const isAdmin = role?.toUpperCase() === 'ADMIN' ||
        currentUser?.memberships?.some(m => m.groupId === activeGroupId && (m.role === 'ADMIN' || m.role === 'SECONDARY_ADMIN'));

    const filteredMembers = members.filter(m =>
        m.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.user.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedGroup = memberships.find(m => m.groupId === activeGroupId)?.group;

    if (isMembershipsLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading your memberships...</div>;
    }

    if (memberships.length === 0 && role?.toUpperCase() !== 'ADMIN') {
        return (
            <div className="p-12 text-center bg-card border border-border rounded-[2rem] shadow-sm">
                <Typography variant="h4" className="text-xl font-bold mb-2">No Memberships Found</Typography>
                <Typography variant="p" className="text-muted-foreground">You don't seem to be part of any family groups yet. Contact an admin to be added.</Typography>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Typography variant="h2" className="text-3xl font-bold text-foreground flex items-center gap-3">
                        Family Members
                        {selectedGroup && (
                            <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                                {selectedGroup.name}
                            </span>
                        )}
                    </Typography>
                    <Typography variant="muted">View and connect with other members in your family groups.</Typography>
                </div>

                <div className="flex gap-3 items-center">
                    {isAdmin && (
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-primary text-primary-foreground font-bold shadow-md flex items-center gap-2 rounded-xl h-11"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add Member
                        </Button>
                    )}
                    {memberships.length > 1 && (
                        <div className="w-full md:w-64">
                            <Select
                                value={activeGroupId || ''}
                                onValueChange={setActiveGroupId}
                            >
                                <SelectTrigger className="h-11 rounded-xl bg-card border-border shadow-sm">
                                    <SelectValue placeholder="Switch Group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {memberships.map((m) => (
                                        <SelectItem key={m.groupId} value={m.groupId}>
                                            {m.group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            <Card className="border-border bg-card shadow-xl shadow-foreground/5 overflow-hidden rounded-[2rem]">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-4 bg-background px-5 py-2 rounded-2xl border border-border w-full md:w-96 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5 transition-all group">
                        <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find someone by name..."
                            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0 p-0 h-auto"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isMembersLoading && activeGroupId ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <div className="flex justify-center mb-4">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                            Loading group members...
                        </div>
                    ) : (filteredMembers.length === 0 || !activeGroupId) ? (
                        <div className="p-12 text-center">
                            <Typography variant="p" className="text-muted-foreground">No members found in this group.</Typography>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs text-muted-foreground font-bold bg-muted/30 uppercase tracking-[0.2em]">
                                        <th className="px-8 py-5">Profile</th>
                                        <th className="px-8 py-5">Role & Relation</th>
                                        <th className="px-8 py-5">Contact</th>
                                        <th className="px-8 py-5 text-center">Status</th>
                                        <th className="px-8 py-5 text-right">Activity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredMembers.map((member) => (
                                        <tr
                                            key={member.id}
                                            className="hover:bg-primary/5 transition-colors cursor-pointer group"
                                            onClick={() => navigate(`/members/${member.id}`)}
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="w-12 h-12 border-2 border-primary/20 bg-muted group-hover:scale-105 transition-transform duration-300">
                                                        <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary uppercase">
                                                            {member.user.name.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <Typography variant="p" className="font-bold text-foreground group-hover:text-primary transition-colors mb-0.5">{member.user.name}</Typography>
                                                        <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-1">
                                                            @{member.user.userName}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className={`w-3 h-3 ${member.role === 'ADMIN' ? 'text-warning' : 'text-primary'}`} />
                                                        <Typography variant="small" className="font-bold text-foreground/80 text-[11px] uppercase tracking-wider">{member.role}</Typography>
                                                    </div>
                                                    <Typography variant="small" className="text-muted-foreground italic text-xs">{member.relation || 'Direct Member'}</Typography>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                                                        <Mail className="w-3 h-3" />
                                                        {member.user.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                                                        <Phone className="w-3 h-3" />
                                                        {member.user.phoneNumber}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.1em] border ${member.status === 'ACTIVE'
                                                    ? 'bg-success/10 text-success border-success/20'
                                                    : 'bg-muted text-muted-foreground border-border'
                                                    }`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <Typography variant="small" className="text-[10px] text-muted-foreground font-bold uppercase">Member Since</Typography>
                                                    <Typography variant="p" className="font-bold text-xs text-foreground">
                                                        {new Date(member.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                    </Typography>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AddMemberModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
}
