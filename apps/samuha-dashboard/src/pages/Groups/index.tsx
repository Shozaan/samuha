import { useState } from 'react';
import {
    Plus,
    Users,
    ArrowRight,
    Settings,
    Shield,
    Calendar,
    Search,
    Filter
} from 'lucide-react';
import {
    Card,
    CardContent,
    Button,
    Typography,
    Input,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@sujan77/ui-components';
import { useGroups, useCreateGroup } from './hooks/useGroups';
import { AddGroupModal } from './components/AddGroupModal';
import type { GroupFormData } from './types';

export default function GroupsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const { data: groupsResponse, isLoading } = useGroups({
        search: searchTerm,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
    });

    const createGroupMutation = useCreateGroup();
    const groups = groupsResponse?.data || [];

    const handleCreateGroup = (values: GroupFormData) => {
        createGroupMutation.mutate(values);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Typography variant="h2" className="text-3xl font-bold text-foreground">Family Groups</Typography>
                    <Typography variant="muted">Manage and organize your collective family investment and savings pools.</Typography>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground font-bold shadow-md hover:scale-[1.02] transition-transform"
                >
                    <Plus className="w-5 h-5" />
                    New Group
                </Button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-row items-center gap-3">
                <div className="relative flex-1 group">
                    <Input
                        placeholder="Search groups..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-12 h-14 rounded-2xl bg-card border-border border-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-sm text-base transition-all"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="w-40 hidden sm:block">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-14 rounded-2xl bg-card border-border border-2 shadow-sm font-bold">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-2">
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
                                <SelectItem value="ARCHIVED">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        variant="outline"
                        className="h-14 rounded-2xl border-border border-2 px-6 font-bold flex items-center gap-2 hover:bg-muted bg-card shadow-sm transition-all"
                    >
                        <Filter className="w-5 h-5" />
                        <span className="hidden md:inline">Filters</span>
                    </Button>
                </div>
            </div>

            {/* Groups Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-muted animate-pulse rounded-3xl" />
                    ))}
                </div>
            ) : groups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <Card key={group.id} className="group border-border bg-card hover:border-primary/50 transition-all duration-300 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5">
                            <CardContent className="p-0">
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div className={`text - [10px] font - black px - 2.5 py - 1 rounded - full uppercase tracking - wider border ${group.status === 'ACTIVE'
                                            ? 'bg-success/10 text-success border-success/20'
                                            : 'bg-muted text-muted-foreground border-border'
                                            }`}>
                                            {group.status}
                                        </div>
                                    </div>

                                    <div>
                                        <Typography variant="h4" className="text-xl font-bold group-hover:text-primary transition-colors">{group.name}</Typography>
                                        <Typography variant="p" className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[40px]">
                                            {group.description || 'No description provided.'}
                                        </Typography>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-2 border-y border-border/50">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Members</div>
                                                <div className="text-sm font-bold">{group._count?.members || 0}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Created</div>
                                                <div className="text-sm font-bold">{new Date(group.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-muted/30 flex items-center justify-between">
                                    <Button variant="ghost" className="p-0 h-auto font-bold text-primary flex items-center gap-2 hover:bg-transparent group-hover:gap-3 transition-all">
                                        Enter Dashboard
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-xl w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Settings className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-2">
                        <Users className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div>
                        <Typography variant="h3" className="text-2xl font-bold">No groups found</Typography>
                        <Typography variant="muted">You haven't created or joined any family groups yet.</Typography>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-white font-bold"
                    >
                        Create Your First Group
                    </Button>
                </div>
            )}

            <AddGroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateGroup}
            />
        </div>
    );
}
