import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Wallet,
    HandCoins,
    ShieldCheck,
    Calendar,
    CreditCard,
    History,
    ChevronRight,
    UserPlus,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Avatar,
    AvatarFallback,
    Typography
} from '@sujan77/ui-components';
import { AssignToGroupModal } from './AssignToGroupModal';
import type { AssignmentData, UserData } from '../types';
import { AddUserModal } from './UserModal';
import { useAssignToGroup, useUpdateUser, useUser } from '../hooks/useUsers';

export default function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    const { data: response, isLoading, isError } = useUser(id || '');
    const updateMemberMutation = useUpdateUser();
    const assignToGroupMutation = useAssignToGroup();
    const memberData = response?.data;

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading member profile...</div>;
    }

    if (isError || !memberData) {
        return <div className="p-8 text-center text-destructive">Failed to load member profile.</div>;
    }

    const member = {
        id: memberData.id,
        name: memberData.name || 'Unknown',
        userName: memberData.userName || '',
        email: memberData.email || '',
        phoneNumber: memberData.phoneNumber || '',
        joinDate: memberData.joinDate || 'Jan 15, 2024',
        status: memberData.status || 'Active',
        deposits: { mandatory: '0', extra: '0', total: memberData.deposits || '0' },
        loans: { count: 0, active: '0', totalTaken: '0' }
    };

    const handleUpdateMember = (values: UserData) => {
        if (id) {
            updateMemberMutation.mutate({ id, data: values });
        }
    };

    const handleAssignToGroup = (values: Omit<AssignmentData, 'userId'>) => {
        if (id) {
            assignToGroupMutation.mutate({
                userId: id,
                ...values
            } as AssignmentData);
        }
    };

    return (
        <>
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/users')}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Directory
                    </Button>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditModalOpen(true)}
                            className="border-primary/20 text-primary hover:bg-primary/5 font-bold"
                        >
                            Edit Profile
                        </Button>
                        <Button
                            onClick={() => setIsAssignModalOpen(true)}
                            className="bg-success text-white hover:bg-success/90 font-bold shadow-md flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            Assign to Group
                        </Button>
                        <Button className="bg-primary text-primary-foreground font-bold shadow-md">Print Summary</Button>
                    </div>
                </div>

                <Card className="border-border bg-card">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <Avatar className="w-24 h-24 rounded-2xl border-2 border-primary/20 bg-muted">
                                <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary uppercase">SK</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <Typography variant="h2" className="text-3xl font-bold text-foreground">{member.name}</Typography>
                                        <span className="bg-success/10 text-success text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-success/20">
                                            {member.status}
                                        </span>
                                    </div>
                                    <Typography variant="muted" className="text-sm font-medium mt-1 uppercase tracking-tighter">User Access ID: #SM-00{member.id}</Typography>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-border">
                                    <div>
                                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-1">Join Date</Typography>
                                        <Typography variant="p" className="font-semibold text-foreground flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-primary" />
                                            {member.joinDate}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-1">Contact Email</Typography>
                                        <Typography variant="p" className="font-semibold text-foreground flex items-center gap-2">
                                            {memberData.email || 'N/A'}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-1">Phone Number</Typography>
                                        <Typography variant="p" className="font-semibold text-foreground flex items-center gap-2">
                                            {memberData.phoneNumber || 'N/A'}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-1">Membership Rank</Typography>
                                        <Typography variant="p" className="font-semibold text-foreground flex items-center gap-2">
                                            <ShieldCheck className="w-3 h-3 text-success" />
                                            Elite
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-1">Last Active</Typography>
                                        <Typography variant="p" className="font-semibold text-foreground flex items-center gap-2 text-primary">
                                            <History className="w-3 h-3" />
                                            2 hours ago
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="md:col-span-2 border-border bg-card">
                        <CardHeader className="border-b border-border pb-6">
                            <div className="flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-primary" />
                                <CardTitle className="text-xl font-bold">Contribution History</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                                <div className="p-6 md:p-8 text-center bg-muted/20">
                                    <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-2">Mandatory Deposits</Typography>
                                    <Typography variant="h4" className="text-2xl font-black text-foreground">NPR {member.deposits.mandatory}</Typography>
                                </div>
                                <div className="p-6 md:p-8 text-center bg-muted/40">
                                    <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-2">Extra contributions</Typography>
                                    <Typography variant="h4" className="text-2xl font-black text-secondary">NPR {member.deposits.extra}</Typography>
                                </div>
                                <div className="p-6 md:p-8 text-center bg-primary/5">
                                    <Typography variant="small" className="text-primary uppercase text-[10px] font-bold block mb-2">Total Accumulated</Typography>
                                    <Typography variant="h4" className="text-2xl font-black text-primary">NPR {member.deposits.total}</Typography>
                                </div>
                            </div>

                            <div className="p-8 border-t border-border">
                                <Typography variant="small" className="font-bold text-foreground mb-4 block">Settlement Forecast (dissolution preview)</Typography>
                                <div className="p-6 rounded-2xl bg-muted/30 border border-border">
                                    <div className="flex justify-between items-center mb-4">
                                        <Typography variant="p" className="text-sm font-medium text-foreground">Projected Share Value</Typography>
                                        <Typography variant="p" className="text-lg font-bold text-success">NPR 45,230</Typography>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full">
                                        <div className="h-full bg-success w-[72%] rounded-full shadow-glow" />
                                    </div>
                                    <Typography variant="small" className="text-[10px] text-muted-foreground mt-3 italic">Calculated based on current savings + 8% accrued group profit.</Typography>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card flex flex-col">
                        <CardHeader className="border-b border-border pb-6">
                            <div className="flex items-center gap-2">
                                <HandCoins className="w-5 h-5 text-warning" />
                                <CardTitle className="text-xl font-bold text-foreground">Loan Summary</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 flex-1 space-y-6">
                            <div className="flex justify-between items-center p-4 rounded-xl bg-muted/50 border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-warning/10 text-warning">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <Typography variant="small" className="font-bold text-foreground">Active Loan</Typography>
                                </div>
                                <Typography variant="p" className="font-black text-foreground">NPR {member.loans.active}</Typography>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <Typography variant="small" className="text-muted-foreground">Repayment Progress</Typography>
                                    <Typography variant="small" className="text-foreground font-bold">45%</Typography>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-warning w-[45%]" />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border mt-auto">
                                <div className="flex justify-between text-xs mb-4">
                                    <Typography variant="small" className="text-muted-foreground">Life-time loans taken</Typography>
                                    <Typography variant="small" className="text-foreground font-bold">NPR {member.loans.totalTaken}</Typography>
                                </div>
                                <Button className="w-full bg-warning hover:bg-warning/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-warning/20 flex items-center justify-center gap-2">
                                    View Loan Details
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AddUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdateUser={handleUpdateMember}
                initialData={{
                    name: member.name,
                    userName: member.userName,
                    email: member.email,
                    phoneNumber: member.phoneNumber,
                }}
                mode="edit"
            />

            <AssignToGroupModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onSubmit={handleAssignToGroup}
                userName={member.name}
                userId={member.id}
            />
        </>
    );
}
