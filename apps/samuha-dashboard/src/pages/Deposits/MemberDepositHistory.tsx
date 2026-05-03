import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Typography,
    Avatar,
    AvatarFallback,
} from '@sujan77/ui-components';
import { useGlobalStore } from '../../store/store';
import { useMember } from '../Members/hooks/useMembers';
import { useDeposits } from './hooks/useDeposits';

const STATUS_CONFIG = {
    PAID: { label: 'Paid', className: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
    LATE: { label: 'Late', className: 'bg-warning/10 text-warning border-warning/20', icon: AlertTriangle },
    PENDING: { label: 'Pending', className: 'bg-orange-400/10 text-orange-400 border-orange-400/20', icon: Clock },
    WAIVED: { label: 'Waived', className: 'bg-muted text-muted-foreground border-border', icon: CheckCircle2 },
};

export default function MemberDepositHistory() {
    const { memberId } = useParams();
    const navigate = useNavigate();
    const { activeGroupId } = useGlobalStore();

    const { data: memberResponse, isLoading: isMemberLoading } = useMember(memberId || '');
    const { data: depositsResponse, isLoading: isDepositsLoading } = useDeposits({
        memberId: memberId || '',
        groupId: activeGroupId || '',
        limit: 200,
    });

    const member = memberResponse?.data;
    const deposits = depositsResponse?.data || [];

    // Stats
    const paidDeposits = deposits.filter((d: any) => d.status === 'PAID' || d.status === 'LATE');
    const pendingDeposits = deposits.filter((d: any) => d.status === 'PENDING');
    const totalPaid = paidDeposits.reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0);
    const totalFines = deposits.reduce((sum: number, d: any) => sum + parseFloat(d.fineAmount || '0'), 0);

    if (isMemberLoading || isDepositsLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading deposit history...</div>;
    }

    if (!member) {
        return <div className="p-8 text-center text-destructive">Member not found.</div>;
    }

    const memberName = member.user.name;
    const initials = memberName.split(' ').map((n: string) => n[0]).join('');

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/deposits')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Deposits
                </Button>
            </div>

            {/* Member Hero */}
            <Card className="border-border bg-card overflow-hidden">
                <div className="h-1.5 bg-primary/30 w-full" />
                <CardContent className="p-6">
                    <div className="flex items-center gap-5">
                        <Avatar className="w-16 h-16 border-2 border-primary/20 bg-muted">
                            <AvatarFallback className="text-xl font-black bg-primary/5 text-primary uppercase">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <Typography variant="h3" className="text-2xl font-black text-foreground">{memberName}</Typography>
                            <Typography variant="small" className="text-muted-foreground text-xs">
                                @{member.user.userName} • <span className="capitalize">{member.role.toLowerCase()}</span> • {member.group.name}
                            </Typography>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-border bg-card">
                    <CardContent className="p-5">
                        <Typography variant="small" className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider block mb-1">Total Paid</Typography>
                        <Typography variant="h4" className="text-xl font-black text-success">NPR {totalPaid.toLocaleString()}</Typography>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardContent className="p-5">
                        <Typography variant="small" className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider block mb-1">Total Fines</Typography>
                        <Typography variant="h4" className="text-xl font-black text-destructive">NPR {totalFines.toLocaleString()}</Typography>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardContent className="p-5">
                        <Typography variant="small" className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider block mb-1">Paid Months</Typography>
                        <Typography variant="h4" className="text-xl font-black text-foreground">{paidDeposits.length}</Typography>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardContent className="p-5">
                        <Typography variant="small" className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider block mb-1">Pending</Typography>
                        <Typography variant="h4" className="text-xl font-black text-warning">{pendingDeposits.length}</Typography>
                    </CardContent>
                </Card>
            </div>

            {/* Deposit History Table */}
            <Card className="border-border bg-card overflow-hidden">
                <CardHeader className="p-6 border-b border-border bg-muted/20">
                    <CardTitle className="text-xl font-bold">Deposit History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {deposits.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <Typography variant="p">No deposit records found for this member.</Typography>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs text-muted-foreground font-bold bg-muted/30 uppercase tracking-widest">
                                        <th className="px-6 py-4">Month</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Due Date</th>
                                        <th className="px-6 py-4">Paid Date</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Fine</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {[...deposits].sort((a: any, b: any) => b.monthYear.localeCompare(a.monthYear)).map((deposit: any) => {
                                        const cfg = STATUS_CONFIG[deposit.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
                                        const Icon = cfg.icon;
                                        const fine = parseFloat(deposit.fineAmount || '0');
                                        return (
                                            <tr key={deposit.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <Typography variant="p" className="font-bold text-foreground">{deposit.monthYear}</Typography>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Typography variant="p" className="font-semibold text-foreground">NPR {parseFloat(deposit.amount).toLocaleString()}</Typography>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Typography variant="small" className="text-muted-foreground text-xs">
                                                        {new Date(deposit.dueDate).toLocaleDateString()}
                                                    </Typography>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Typography variant="small" className="text-muted-foreground text-xs">
                                                        {deposit.paidDate ? new Date(deposit.paidDate).toLocaleDateString() : '—'}
                                                    </Typography>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${cfg.className}`}>
                                                        <Icon className="w-3 h-3" />
                                                        {cfg.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {fine > 0 ? (
                                                        <span className="text-destructive font-bold text-sm">NPR {fine.toLocaleString()}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
