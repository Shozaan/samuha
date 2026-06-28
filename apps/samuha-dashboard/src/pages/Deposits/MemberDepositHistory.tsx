import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, CalendarX, BellRing } from 'lucide-react';
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
import { useQuery } from '@tanstack/react-query';
import { SettingsApi } from '../Settings/settings.api';
import { BannerCard } from '../../components/BannerCard';

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
    const { data: rulesData } = useQuery({
        queryKey: ['group-rules', activeGroupId],
        queryFn: () => SettingsApi.getGroupRules(activeGroupId || 'default'),
        enabled: !!activeGroupId,
    });

    const member = memberResponse?.data;
    const deposits = depositsResponse?.data || [];

    // Rules
    const rulesArray = Array.isArray(rulesData?.data) ? rulesData.data : [];
    const rules = rulesArray[0] ?? null;
    const lateDepositFineRate = parseFloat(rules?.lateDepositFineAmount ?? rules?.lateDepositFine ?? '0');
    const depositDueDay = parseInt(rules?.depositDueDay ?? rules?.depositDeadline ?? '15', 10);
    const monthlyDepositAmount = parseFloat(rules?.monthlyDepositAmount ?? rules?.mandatoryDeposit ?? '0');

    // Current month
    const now = new Date();
    const currentMonthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dueDate = new Date(now.getFullYear(), now.getMonth(), depositDueDay);
    const isDeadlinePassed = now > dueDate;
    const overduedays = isDeadlinePassed ? Math.floor((now.getTime() - dueDate.getTime()) / 86400000) : 0;
    const daysRemaining = !isDeadlinePassed ? Math.ceil((dueDate.getTime() - now.getTime()) / 86400000) : 0;
    const currentMonthDeposit = deposits.find((d: any) => d.monthYear === currentMonthValue);
    const isCurrentMonthPaid = currentMonthDeposit?.status === 'PAID';

    // Fine calculation: rate × days overdue (prefer server fineAmount if set)
    const getComputedFine = (deposit: any) => {
        const serverFine = parseFloat(deposit.fineAmount || '0');
        if (serverFine > 0) return serverFine;
        if (deposit.status === 'PENDING' && deposit.dueDate) {
            const due = new Date(deposit.dueDate);
            if (now > due) {
                const days = Math.floor((now.getTime() - due.getTime()) / 86400000);
                return lateDepositFineRate * days;
            }
        }
        return 0;
    };

    // Current month fine
    const currentMonthFine = isDeadlinePassed && !isCurrentMonthPaid
        ? (currentMonthDeposit && parseFloat(currentMonthDeposit.fineAmount || '0') > 0
            ? parseFloat(currentMonthDeposit.fineAmount)
            : lateDepositFineRate * overduedays)
        : 0;

    // Stats (from DB)
    const paidDeposits = deposits.filter((d: any) => d.status === 'PAID');
    const pendingDeposits = deposits.filter((d: any) => d.status === 'PENDING' || d.status === 'LATE');
    const overdueDeposits = pendingDeposits.filter((d: any) => new Date(d.dueDate) < now);
    
    const totalPaid = paidDeposits.reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0);
    let totalPendingAmount = pendingDeposits.reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0);
    let totalFines = deposits.reduce((sum: number, d: any) => sum + getComputedFine(d), 0);
    
    let pendingCount = pendingDeposits.length;
    let overdueCount = overdueDeposits.length;

    // If current month is completely missing from DB, add it to our owed totals
    const isCurrentMonthPendingInDB = currentMonthDeposit?.status === 'PENDING';
    const isCurrentMonthMissing = !isCurrentMonthPaid && !isCurrentMonthPendingInDB;
    
    if (isCurrentMonthMissing) {
        pendingCount += 1;
        totalPendingAmount += monthlyDepositAmount;
        if (isDeadlinePassed) {
            overdueCount += 1;
            totalFines += currentMonthFine;
        }
    }

    const totalMonths = deposits.length + (isCurrentMonthMissing ? 1 : 0);

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

            {/* Current Month Banner */}
            <BannerCard
                variant={isCurrentMonthPaid ? 'success' : isDeadlinePassed ? 'destructive' : 'warning'}
                icon={isCurrentMonthPaid ? <CheckCircle2 className="w-8 h-8" /> : isDeadlinePassed ? <CalendarX className="w-8 h-8" /> : <BellRing className="w-8 h-8" />}
                title={
                    isCurrentMonthPaid
                        ? 'This month\'s deposit is paid ✓'
                        : isDeadlinePassed
                            ? `Overdue by ${overduedays} day${overduedays !== 1 ? 's' : ''} — Fine accumulating`
                            : `Deposit due in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`
                }
                subtitle={
                    <>
                        {isCurrentMonthPaid
                            ? `Paid for ${currentMonthValue}`
                            : `Due by ${dueDate.toLocaleDateString()}`}
                        {monthlyDepositAmount > 0 && ` · NPR ${monthlyDepositAmount.toLocaleString()} required`}
                    </>
                }
                /*
                rightLabel={!isCurrentMonthPaid && isDeadlinePassed && currentMonthFine > 0 ? 'Total Fine' : undefined}
                rightValue={!isCurrentMonthPaid && isDeadlinePassed && currentMonthFine > 0 ? `NPR ${currentMonthFine.toLocaleString()}` : undefined}
                rightSubtext={
                    !isCurrentMonthPaid && isDeadlinePassed && currentMonthFine > 0 && lateDepositFineRate > 0 ? (
                        <div className="text-[10px] text-destructive/60 font-bold mt-1">
                            NPR {lateDepositFineRate.toLocaleString()}/day × {overduedays}d
                        </div>
                    ) : null
                }
                */
            />

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Paid */}
                <Card className="border-success/20 bg-success/5">
                    <CardContent className="p-5">
                        <Typography variant="small" className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider block mb-1">Total Paid</Typography>
                        <Typography variant="h4" className="text-xl font-black text-success">NPR {totalPaid.toLocaleString()}</Typography>
                        <Typography variant="small" className="text-[10px] text-muted-foreground font-bold mt-1 block">
                            {paidDeposits.length} month{paidDeposits.length !== 1 ? 's' : ''} paid
                        </Typography>
                    </CardContent>
                </Card>

                {/* Total Fines Card commented out
                <Card className={`${totalFines > 0 ? 'border-destructive/20 bg-destructive/5' : 'border-border bg-card'}`}>
                    <CardContent className="p-5">
                        <Typography variant="small" className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider block mb-1">Total Fines</Typography>
                        <Typography variant="h4" className={`text-xl font-black ${totalFines > 0 ? 'text-destructive' : 'text-foreground'}`}>
                            NPR {totalFines.toLocaleString()}
                        </Typography>
                        {totalFines > 0 && lateDepositFineRate > 0 ? (
                            <Typography variant="small" className="text-[10px] text-destructive/70 font-bold mt-1 block">
                                NPR {lateDepositFineRate.toLocaleString()}/day · {overdueCount} overdue
                            </Typography>
                        ) : (
                            <Typography variant="small" className="text-[10px] text-success font-bold mt-1 block">No fines</Typography>
                        )}
                    </CardContent>
                </Card>
                */}

                {/* Paid Months */}
                <Card className="border-border bg-card">
                    <CardContent className="p-5">
                        <Typography variant="small" className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider block mb-1">Paid Months</Typography>
                        <Typography variant="h4" className="text-xl font-black text-foreground">
                            {paidDeposits.length}
                            <span className="text-sm font-medium text-muted-foreground"> / {totalMonths}</span>
                        </Typography>
                        <div className="mt-2 h-1.5 w-full bg-muted rounded-full">
                            <div
                                className="h-full bg-success rounded-full transition-all duration-700"
                                style={{ width: totalMonths > 0 ? `${Math.round((paidDeposits.length / totalMonths) * 100)}%` : '0%' }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Pending */}
                <Card className={`${pendingCount > 0 ? 'border-warning/20 bg-warning/5' : 'border-border bg-card'}`}>
                    <CardContent className="p-5">
                        <Typography variant="small" className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider block mb-1">Pending</Typography>
                        <Typography variant="h4" className={`text-xl font-black ${pendingCount > 0 ? 'text-warning' : 'text-foreground'}`}>
                            {pendingCount} month{pendingCount !== 1 ? 's' : ''}
                        </Typography>
                        {totalPendingAmount > 0 ? (
                            <Typography variant="small" className="text-[10px] text-warning/80 font-bold mt-1 block">
                                NPR {totalPendingAmount.toLocaleString()} owed
                            </Typography>
                        ) : (
                            <Typography variant="small" className="text-[10px] text-success font-bold mt-1 block">All clear</Typography>
                        )}
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
                                        {/* <th className="px-6 py-4 text-right">Fine</th> */}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {[...deposits].sort((a: any, b: any) => b.monthYear.localeCompare(a.monthYear)).map((deposit: any) => {
                                        const cfg = STATUS_CONFIG[deposit.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
                                        const Icon = cfg.icon;
                                        const fine = getComputedFine(deposit);
                                        const isOverdue = deposit.status === 'PENDING' && new Date(deposit.dueDate) < now;
                                        const dueD = new Date(deposit.dueDate);
                                        const overdueDays = isOverdue ? Math.floor((now.getTime() - dueD.getTime()) / 86400000) : 0;
                                        return (
                                            <tr key={deposit.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <Typography variant="p" className="font-bold text-foreground">{deposit.monthYear}</Typography>
                                                    {isOverdue && (
                                                        <span className="text-[9px] text-destructive font-black uppercase">{overdueDays}d overdue</span>
                                                    )}
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
                                                <td className="px-6 py-4 text-right text-muted-foreground italic text-[10px]">
                                                    {/* Fines commented out
                                                    {fine > 0 ? (
                                                        <div>
                                                            <span className="text-destructive font-bold text-sm block">NPR {fine.toLocaleString()}</span>
                                                            {isOverdue && lateDepositFineRate > 0 && (
                                                                <span className="text-[9px] text-destructive/60 font-bold">
                                                                    {lateDepositFineRate}/day × {overdueDays}d
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">—</span>
                                                    )}
                                                    */}
                                                    -
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
