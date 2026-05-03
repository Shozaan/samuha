import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Wallet,
    HandCoins,
    Calendar,
    CreditCard,
    ChevronRight,
    Shield,
    Mail,
    Phone,
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
import { useMember } from '../hooks/useMembers';

export default function MemberProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: response, isLoading, isError } = useMember(id || '');
    const memberData = response?.data;

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading member profile...</div>;
    }

    if (isError || !memberData) {
        return <div className="p-8 text-center text-destructive">Failed to load member profile.</div>;
    }

    const member = {
        id: memberData.id,
        name: memberData.user.name,
        userName: memberData.user.userName,
        email: memberData.user.email,
        phoneNumber: memberData.user.phoneNumber,
        role: memberData.role,
        relation: memberData.relation || 'Direct Member',
        status: memberData.status,
        joinDate: new Date(memberData.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        groupName: memberData.group.name,
        deposits: {
            total: memberData.financialSummary?.totalDeposits.toLocaleString() || '0',
        },
        loans: {
            active: memberData.financialSummary?.activeLoanPrincipal.toLocaleString() || '0',
            totalTaken: memberData.financialSummary?.totalLoansPrincipal.toLocaleString() || '0',
            repaymentProgress: memberData.financialSummary?.repaymentProgress || 0,
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/members')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Family Members
                </Button>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="border-primary/20 text-primary hover:bg-primary/5 font-bold"
                    >
                        Activity Log
                    </Button>
                    <Button className="bg-primary text-primary-foreground font-bold shadow-md">Print Summary</Button>
                </div>
            </div>

            {/* Profile Hero */}
            <Card className="border-border bg-card overflow-hidden">
                <div className="h-2 bg-primary/20 w-full" />
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <Avatar className="w-28 h-28 rounded-[2rem] border-4 border-primary/10 bg-muted shadow-inner">
                            <AvatarFallback className="text-4xl font-black bg-primary/5 text-primary uppercase">
                                {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <Typography variant="h2" className="text-3xl font-black text-foreground tracking-tight">{member.name}</Typography>
                                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-[0.15em] border ${member.status === 'ACTIVE'
                                            ? 'bg-success/10 text-success border-success/20'
                                            : 'bg-muted text-muted-foreground border-border'
                                            }`}>
                                            {member.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <Typography variant="p" className="text-sm font-bold text-primary flex items-center gap-1.5 bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                                            <Shield className="w-4 h-4" />
                                            {member.role}
                                        </Typography>
                                        <Typography variant="small" className="text-muted-foreground font-black uppercase text-[10px] tracking-widest bg-muted/30 px-3 py-1 rounded-lg border border-border">
                                            {member.relation}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="text-left md:text-right">
                                    <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em] block mb-1">Current Group</Typography>
                                    <Typography variant="p" className="font-black text-foreground text-xl capitalize flex items-center md:justify-end gap-2">
                                        <span className="w-2 h-2 rounded-full bg-primary" />
                                        {member.groupName}
                                    </Typography>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-border/50">
                                <div className="space-y-1">
                                    <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-black tracking-widest block mb-1">Member Since</Typography>
                                    <Typography variant="p" className="font-bold text-foreground flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        {member.joinDate}
                                    </Typography>
                                </div>
                                <div className="space-y-1">
                                    <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-black tracking-widest block mb-1">Contact Email</Typography>
                                    <Typography variant="p" className="font-bold text-foreground flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-primary" />
                                        {member.email}
                                    </Typography>
                                </div>
                                <div className="space-y-1">
                                    <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-black tracking-widest block mb-1">Phone Number</Typography>
                                    <Typography variant="p" className="font-bold text-foreground flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-primary" />
                                        {member.phoneNumber}
                                    </Typography>
                                </div>
                                <div className="space-y-1">
                                    <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-black tracking-widest block mb-1">System Access ID</Typography>
                                    <Typography variant="p" className="font-bold text-foreground font-mono text-xs uppercase tracking-tighter">
                                        #MEM-{member.id.toUpperCase().slice(-8)}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Contribution Summary */}
                <Card className="md:col-span-2 border-border bg-card shadow-xl shadow-foreground/5 overflow-hidden rounded-[2rem]">
                    <CardHeader className="border-b border-border p-8 bg-muted/10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black tracking-tight">Financial standing</CardTitle>
                                <Typography variant="muted" className="text-sm font-medium">Overview of your contributions and savings in this group.</Typography>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                            <div className="p-10 text-center hover:bg-muted/30 transition-colors">
                                <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em] block mb-3">Total Deposits</Typography>
                                <Typography variant="h4" className="text-3xl font-black text-foreground">NPR {member.deposits.total}</Typography>
                            </div>
                            <div className="p-10 text-center bg-primary/5 hover:bg-primary/10 transition-all">
                                <Typography variant="small" className="text-primary uppercase text-[10px] font-black tracking-[0.2em] block mb-3">Total Accumulated</Typography>
                                <Typography variant="h4" className="text-3xl font-black text-primary">NPR {member.deposits.total}</Typography>
                            </div>
                        </div>

                        <div className="p-8 border-t border-border/80 mx-2 mb-2 rounded-[1.5rem] bg-muted/20">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <Typography variant="p" className="font-black text-foreground uppercase tracking-wider text-xs mb-1">Settlement Forecast</Typography>
                                    <Typography variant="small" className="text-[10px] text-muted-foreground italic font-medium">Estimated value if dissolution happened today.</Typography>
                                </div>
                                <Typography variant="p" className="text-2xl font-black text-success">NPR 0</Typography>
                            </div>
                            <div className="h-3 w-full bg-muted rounded-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-success/20 w-full animate-pulse" />
                                <div className="h-full bg-success w-[5%] rounded-full shadow-glow" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Loan Summary */}
                <Card className="border-border bg-card shadow-xl shadow-foreground/5 overflow-hidden rounded-[2rem] flex flex-col">
                    <CardHeader className="border-b border-border p-8 bg-muted/10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-warning/10 rounded-2xl text-warning">
                                <HandCoins className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black tracking-tight">Loan Summary</CardTitle>
                                <Typography variant="muted" className="text-sm font-medium">Your current borrowing status.</Typography>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 flex-1 flex flex-col justify-between space-y-8">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center p-6 rounded-[1.5rem] bg-muted/30 border border-border/60">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-warning/5 text-warning">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <Typography variant="p" className="font-black text-foreground uppercase tracking-widest text-xs">Active Debt</Typography>
                                </div>
                                <Typography variant="p" className="font-black text-foreground text-xl tracking-tight">NPR {member.loans.active}</Typography>
                            </div>

                            <div className="space-y-4 px-2">
                                <div className="flex justify-between text-[11px] uppercase font-black tracking-widest">
                                    <Typography variant="small" className="text-muted-foreground">Repayment Progress</Typography>
                                    <Typography variant="small" className="text-foreground">{member.loans.repaymentProgress}%</Typography>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-warning transition-all duration-1000" style={{ width: `${member.loans.repaymentProgress}%` }} />
                                </div>
                                <Typography variant="small" className="text-[10px] text-muted-foreground text-center block italic font-medium">
                                    {member.loans.repaymentProgress === 0 ? 'No active loans for this member.' : `${member.loans.repaymentProgress}% of total loan repaid`}
                                </Typography>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-border mt-auto">
                            <div className="flex justify-between items-center mb-6 px-2">
                                <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em]">Total Borrowed</Typography>
                                <Typography variant="p" className="text-foreground font-black text-lg">NPR {member.loans.totalTaken}</Typography>
                            </div>
                            <Button className="w-full bg-warning hover:bg-warning/90 text-white font-black uppercase tracking-[0.2em] text-[10px] py-6 rounded-2xl shadow-xl shadow-warning/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                                Request Loan
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
