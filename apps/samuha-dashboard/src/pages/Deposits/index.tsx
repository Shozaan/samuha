import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Download,
    Filter,
    CheckCircle2,
    Clock,
    Plus,
    AlertTriangle,
    Wallet,
    AlertCircle,
    CalendarX,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Typography
} from '@sujan77/ui-components';
import { useGlobalStore } from '../../store/store';
import { DepositModal } from './components/DepositModal';
import { MakeDepositModal } from './components/MakeDepositModal';
import { useCreateDeposit, useDeposits, useUpdateDeposit, useDeleteDeposit } from './hooks/useDeposits';
import type { DepositPostData } from './types';
import { useGroupMembers } from '../Members/hooks/useMembers';
import { SettingsApi } from '../Settings/settings.api';
import { useQuery } from '@tanstack/react-query';
import { BellRing, BadgeCheck } from 'lucide-react';

const getRecentMonths = () => {
    const months = [];
    const date = new Date();
    for (let i = 5; i >= 0; i--) {
        const tempDate = new Date(date.getFullYear(), date.getMonth() - i, 1);
        months.push({
            label: tempDate.toLocaleDateString('en-US', { month: 'short' }),
            value: `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}`
        });
    }
    return months;
};

export default function DepositsGrid() {
    const navigate = useNavigate();
    const { role, activeGroupId, activeMemberId } = useGlobalStore();
    const isAdmin = role?.toUpperCase() === 'ADMIN' || role?.toUpperCase() === 'SECONDARY_ADMIN';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMakeModalOpen, setIsMakeModalOpen] = useState(false);
    const createDeposit = useCreateDeposit();
    const updateDeposit = useUpdateDeposit();
    const deleteDeposit = useDeleteDeposit();

    // Fetch real data based on the active group
    const { data: membersResponse } = useGroupMembers(activeGroupId || '');
    const { data: depositsResponse } = useDeposits({ groupId: activeGroupId || '', limit: 1000 });

    const members = membersResponse?.data || [];
    const allDeposits = depositsResponse?.data || [];
    const recentMonths = getRecentMonths();
    const currentMonthData = recentMonths[recentMonths.length - 1];

    // My personal deposits (for the logged-in member)
    const { data: myDepositsResponse } = useDeposits({
        memberId: activeMemberId || '',
        groupId: activeGroupId || '',
        limit: 100,
    });
    const myDeposits = (myDepositsResponse?.data || []).sort((a: any, b: any) => b.monthYear.localeCompare(a.monthYear)).slice(0, 6);
    const myTotalPaid = myDeposits.filter((d: any) => d.status === 'PAID' || d.status === 'LATE').reduce((s: number, d: any) => s + parseFloat(d.amount), 0);
    const myPendingFines = myDeposits.reduce((s: number, d: any) => s + parseFloat(d.fineAmount || '0'), 0);

    // Missed deposit deadlines (overdue + unpaid)
    const now = new Date();
    const allMyDeposits = myDepositsResponse?.data || [];
    const missedDepositDeadlines = allMyDeposits
        .filter((d: any) => d.status === 'PENDING' && new Date(d.dueDate) < now)
        .map((d: any) => ({
            ...d,
            daysOverdue: Math.floor((now.getTime() - new Date(d.dueDate).getTime()) / 86400000),
            fine: parseFloat(d.fineAmount || '0'),
        }))
        .sort((a: any, b: any) => b.daysOverdue - a.daysOverdue);
    const totalMissedFines = missedDepositDeadlines.reduce((s: number, d: any) => s + d.fine, 0);

    // Fetch active group rules for deposit amount + due day
    const { data: rulesData } = useQuery({
        queryKey: ['group-rules', activeGroupId],
        queryFn: () => SettingsApi.getGroupRules(activeGroupId || 'default'),
        enabled: !!activeGroupId,
    });
    const rules = rulesData?.data;
    const monthlyDepositAmount = parseFloat(rules?.monthlyDepositAmount || rules?.mandatoryDeposit || '0');
    const depositDueDay = parseInt(rules?.depositDueDay || rules?.depositDeadline || '15', 10);
    const lateDepositFine = parseFloat(rules?.lateDepositFineAmount || rules?.lateDepositFine || '0');

    // Current month deposit status for the logged-in member
    const currentMonthValue = currentMonthData.value; // e.g. "2026-05"
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const dueDate = new Date(currentYear, currentMonth, depositDueDay);
    const isDeadlinePassed = now > dueDate;
    const daysOverdueCurrentMonth = isDeadlinePassed
        ? Math.floor((now.getTime() - dueDate.getTime()) / 86400000)
        : Math.ceil((dueDate.getTime() - now.getTime()) / 86400000); // days remaining

    const myCurrentMonthDeposit = allMyDeposits.find(
        (d: any) => d.monthYear === currentMonthValue
    );
    const isCurrentMonthPaid = myCurrentMonthDeposit?.status === 'PAID' || myCurrentMonthDeposit?.status === 'LATE';
    const isCurrentMonthPending = myCurrentMonthDeposit?.status === 'PENDING';
    // Not in DB at all = not paid yet
    const currentMonthFine = isDeadlinePassed && !isCurrentMonthPaid
        ? (myCurrentMonthDeposit ? parseFloat(myCurrentMonthDeposit.fineAmount || '0') : lateDepositFine)
        : 0;

    // Aggregations
    const currentMonthDeposits = allDeposits.filter((d: any) => d.monthYear === currentMonthData.value && (d.status === 'PAID' || d.status === 'LATE'));
    const totalCollectedCurrentMonth = currentMonthDeposits.reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0);
    const pendingDeposits = allDeposits.filter((d: any) => d.status === 'PENDING');

    // Calculate defaulters for current month (members who haven't paid)
    const activeMembers = members.filter((m: any) => m.status === 'ACTIVE');
    const defaultersCount = activeMembers.length - currentMonthDeposits.length;

    const collectionProgress = activeMembers.length > 0
        ? Math.round((currentMonthDeposits.length / activeMembers.length) * 100)
        : 0;

    // Transform data for the grid
    const depositsGridData = activeMembers.map((member: any) => {
        const records = recentMonths.map((month: any) => {
            const deposit = allDeposits.find((d: any) => d.memberId === member.id && d.monthYear === month.value);
            return deposit && (deposit.status === 'PAID' || deposit.status === 'LATE') ? true : false;
        });

        return {
            id: member.id,
            name: member.user.name,
            records
        };
    });

    const handleRecordDeposit = (data: DepositPostData) => {
        createDeposit.mutate(data);
    };

    const handleApprove = (id: string) => {
        if (window.confirm("Approve this deposit request?")) {
            // we update to PAID
            updateDeposit.mutate({ id, data: { status: 'PAID' } });
        }
    };

    const handleReject = (id: string) => {
        if (window.confirm("Reject and delete this deposit request?")) {
            deleteDeposit.mutate(id);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Typography variant="h2" className="text-3xl font-bold text-foreground">Monthly Deposits</Typography>
                    <Typography variant="muted">Track mandatory savings progress for each member across the fiscal year.</Typography>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsMakeModalOpen(true)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90"
                    >
                        <Plus className="w-4 h-4" />
                        Make Deposit
                    </Button>
                    {isAdmin && (
                        <>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 bg-success text-white font-bold shadow-md hover:bg-success/90"
                            >
                                <Plus className="w-4 h-4" />
                                Record Deposit
                            </Button>
                            <Button className="flex items-center gap-2 bg-muted text-muted-foreground hover:text-foreground font-bold shadow-md hover:bg-muted/80 border border-border">
                                <Download className="w-4 h-4" />
                                Export Grid
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <DepositModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleRecordDeposit}
            />

            <MakeDepositModal
                isOpen={isMakeModalOpen}
                onClose={() => setIsMakeModalOpen(false)}
                onSubmit={handleRecordDeposit}
            />

            {/* ── This Month's Deposit Banner ── */}
            {activeMemberId && monthlyDepositAmount > 0 && (
                <Card className={`overflow-hidden border-2 transition-all ${
                    isCurrentMonthPaid
                        ? 'border-success/30 bg-success/5'
                        : isDeadlinePassed
                            ? 'border-destructive/40 bg-destructive/5'
                            : 'border-warning/30 bg-warning/5'
                }`}>
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row items-stretch">
                            {/* Left: Status indicator */}
                            <div className={`flex items-center gap-5 p-6 flex-1 ${
                                isCurrentMonthPaid ? '' : isDeadlinePassed ? '' : ''
                            }`}>
                                <div className={`p-4 rounded-2xl shrink-0 ${
                                    isCurrentMonthPaid
                                        ? 'bg-success/15 text-success'
                                        : isDeadlinePassed
                                            ? 'bg-destructive/15 text-destructive'
                                            : 'bg-warning/15 text-warning'
                                }`}>
                                    {isCurrentMonthPaid
                                        ? <BadgeCheck className="w-8 h-8" />
                                        : isDeadlinePassed
                                            ? <CalendarX className="w-8 h-8" />
                                            : <BellRing className="w-8 h-8" />
                                    }
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <Typography variant="h4" className={`text-xl font-black ${
                                            isCurrentMonthPaid ? 'text-success' : isDeadlinePassed ? 'text-destructive' : 'text-warning'
                                        }`}>
                                            {isCurrentMonthPaid
                                                ? `${currentMonthData.label} Deposit — Paid ✓`
                                                : isDeadlinePassed
                                                    ? `${currentMonthData.label} Deposit — Overdue!`
                                                    : `${currentMonthData.label} Deposit — Due Soon`
                                            }
                                        </Typography>
                                    </div>
                                    <Typography variant="small" className="text-muted-foreground text-xs">
                                        {isCurrentMonthPaid
                                            ? `You have paid your deposit for ${currentMonthData.label}. Great job!`
                                            : isDeadlinePassed
                                                ? `Deadline was ${dueDate.toLocaleDateString()} — ${daysOverdueCurrentMonth} day${daysOverdueCurrentMonth !== 1 ? 's' : ''} overdue. Fines are accumulating.`
                                                : `Pay by ${dueDate.toLocaleDateString()} — ${daysOverdueCurrentMonth} day${daysOverdueCurrentMonth !== 1 ? 's' : ''} remaining to avoid a fine.`
                                        }
                                    </Typography>
                                </div>
                            </div>

                            {/* Right: Amounts */}
                            <div className={`flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 px-6 py-4 md:py-6 border-t md:border-t-0 md:border-l ${
                                isCurrentMonthPaid ? 'border-success/20' : isDeadlinePassed ? 'border-destructive/20' : 'border-warning/20'
                            } bg-background/40 min-w-[180px]`}>
                                <div className="text-center md:text-right">
                                    <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-0.5">Deposit Amount</Typography>
                                    <Typography variant="h4" className="text-2xl font-black text-foreground">
                                        NPR {monthlyDepositAmount.toLocaleString()}
                                    </Typography>
                                </div>
                                {!isCurrentMonthPaid && isDeadlinePassed && currentMonthFine > 0 && (
                                    <div className="text-center md:text-right">
                                        <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-0.5">Fine</Typography>
                                        <Typography variant="h4" className="text-xl font-black text-destructive">
                                            + NPR {currentMonthFine.toLocaleString()}
                                        </Typography>
                                    </div>
                                )}
                                {!isCurrentMonthPaid && (
                                    <Button
                                        onClick={() => setIsMakeModalOpen(true)}
                                        className={`font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-lg ${
                                            isDeadlinePassed
                                                ? 'bg-destructive hover:bg-destructive/90 text-white shadow-destructive/20'
                                                : 'bg-warning hover:bg-warning/90 text-white shadow-warning/20'
                                        }`}
                                    >
                                        Pay Now
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── My Deposits Section ── */}
            {activeMemberId && (
                <Card className="border-primary/20 bg-primary/5 overflow-hidden">
                    <CardHeader className="p-6 border-b border-primary/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                    <Wallet className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">My Deposits</CardTitle>
                                    <Typography variant="small" className="text-muted-foreground text-xs">Your recent 6 months of deposits and fines</Typography>
                                </div>
                            </div>
                            <div className="flex gap-6 text-right">
                                <div>
                                    <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-black block">Total Paid</Typography>
                                    <Typography variant="p" className="font-black text-success">NPR {myTotalPaid.toLocaleString()}</Typography>
                                </div>
                                {myPendingFines > 0 && (
                                    <div>
                                        <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-black block">Fines</Typography>
                                        <Typography variant="p" className="font-black text-destructive">NPR {myPendingFines.toLocaleString()}</Typography>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {myDeposits.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Typography variant="small">No deposit records found.</Typography>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {myDeposits.map((deposit: any) => {
                                    const fine = parseFloat(deposit.fineAmount || '0');
                                    const isPaid = deposit.status === 'PAID' || deposit.status === 'LATE';
                                    const isLate = deposit.status === 'LATE';
                                    return (
                                        <div key={deposit.id} className="px-6 py-4 flex items-center justify-between hover:bg-primary/5 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-xl ${
                                                    isPaid && !isLate ? 'bg-success/10 text-success' :
                                                    isLate ? 'bg-warning/10 text-warning' :
                                                    'bg-orange-400/10 text-orange-400'
                                                }`}>
                                                    {isPaid && !isLate ? <CheckCircle2 className="w-4 h-4" /> :
                                                     isLate ? <AlertTriangle className="w-4 h-4" /> :
                                                     <Clock className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <Typography variant="p" className="font-bold text-foreground text-sm">{deposit.monthYear}</Typography>
                                                    <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-bold">
                                                        Due: {new Date(deposit.dueDate).toLocaleDateString()}
                                                    </Typography>
                                                </div>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <Typography variant="p" className="font-bold text-foreground text-sm">NPR {parseFloat(deposit.amount).toLocaleString()}</Typography>
                                                {fine > 0 && (
                                                    <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20 block">
                                                        Fine: NPR {fine.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ── Missed Deposit Deadlines ── */}
            {activeMemberId && missedDepositDeadlines.length > 0 && (
                <Card className="border-destructive/30 bg-destructive/5 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <CardHeader className="p-5 border-b border-destructive/20 bg-destructive/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-destructive/15 rounded-xl">
                                    <CalendarX className="w-5 h-5 text-destructive" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
                                        Missed Deposit Deadlines
                                        <span className="text-[10px] bg-destructive text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                            {missedDepositDeadlines.length} Overdue
                                        </span>
                                    </CardTitle>
                                    <Typography variant="small" className="text-destructive/70 text-xs">Pay as soon as possible to avoid further fines</Typography>
                                </div>
                            </div>
                            {totalMissedFines > 0 && (
                                <div className="text-right">
                                    <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-black block">Total Fines Accrued</Typography>
                                    <Typography variant="p" className="font-black text-destructive text-lg">NPR {totalMissedFines.toLocaleString()}</Typography>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-destructive/10">
                            {missedDepositDeadlines.map((d: any) => (
                                <div key={d.id} className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-destructive/10 rounded-xl">
                                            <AlertCircle className="w-4 h-4 text-destructive" />
                                        </div>
                                        <div>
                                            <Typography variant="p" className="font-bold text-foreground text-sm">{d.monthYear}</Typography>
                                            <Typography variant="small" className="text-[10px] text-destructive font-black uppercase tracking-wider">
                                                Due {new Date(d.dueDate).toLocaleDateString()} &nbsp;·&nbsp; {d.daysOverdue} day{d.daysOverdue !== 1 ? 's' : ''} overdue
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <Typography variant="p" className="font-bold text-foreground text-sm">NPR {parseFloat(d.amount).toLocaleString()}</Typography>
                                        {d.fine > 0 && (
                                            <span className="text-[10px] font-black text-white bg-destructive px-2.5 py-0.5 rounded-full block">
                                                Fine: NPR {d.fine.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border bg-card">
                    <CardContent className="p-6">
                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-1">Total Collected ({currentMonthData.label})</Typography>
                        <Typography variant="h4" className="text-2xl font-black text-foreground">NPR {totalCollectedCurrentMonth.toLocaleString()}</Typography>
                        <div className={`mt-2 text-xs font-bold text-success flex items-center gap-1`}>
                            Calculated dynamically
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardContent className="p-6">
                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-1">Collection Progress</Typography>
                        <Typography variant="h4" className="text-2xl font-black text-foreground">{collectionProgress}%</Typography>
                        <div className="mt-2 h-1.5 w-full bg-muted rounded-full">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${collectionProgress}%` }} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardContent className="p-6">
                        <Typography variant="small" className="text-muted-foreground uppercase text-[10px] font-bold block mb-1">Defaulters ({currentMonthData.label})</Typography>
                        <Typography variant="h4" className="text-2xl font-black text-destructive">{defaultersCount} Members</Typography>
                        <div className="mt-2 text-[10px] text-muted-foreground font-medium">Have not paid this month</div>
                    </CardContent>
                </Card>
            </div>

            {isAdmin && pendingDeposits.length > 0 && (
                <Card className="border-warning bg-warning/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-warning/20 bg-warning/10">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-warning">
                                Pending Deposit Requests
                                <span className="text-[10px] bg-warning text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{pendingDeposits.length} Pending</span>
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <div className="divide-y divide-border">
                        {pendingDeposits.map((deposit: any) => {
                            const memberName = members.find((m: any) => m.id === deposit.memberId)?.user.name || 'Unknown Member';
                            return (
                                <div key={deposit.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card hover:bg-muted/30 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                                            <Clock className="w-5 h-5 text-warning" />
                                        </div>
                                        <div>
                                            <Typography variant="p" className="font-bold text-foreground text-sm sm:text-base">
                                                {memberName} <span className="text-muted-foreground font-normal">requested a deposit of</span> NPR {parseFloat(deposit.amount).toLocaleString()}
                                            </Typography>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-bold">Month: {deposit.monthYear}</Typography>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-bold">Mode: {deposit.paymentMode}</Typography>
                                                {deposit.voucherUrl && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-border" />
                                                        <a href={deposit.voucherUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase text-primary hover:underline flex items-center gap-1">
                                                            View Receipt
                                                        </a>
                                                    </>
                                                )}
                                            </div>
                                            {deposit.notes && (
                                                <Typography variant="small" className="text-xs text-muted-foreground mt-2 block w-full">
                                                    "{deposit.notes}"
                                                </Typography>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleReject(deposit.id)}
                                            className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 font-bold"
                                        >
                                            Reject
                                        </Button>
                                        <Button 
                                            size="sm"
                                            onClick={() => handleApprove(deposit.id)}
                                            className="w-full sm:w-auto bg-success hover:bg-success/90 text-white font-bold"
                                        >
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            <Card className="border-border bg-card overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border bg-muted/30">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            Monthly Deposits
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-primary/20">Active Session</span>
                        </CardTitle>
                    </div>
                    <Button variant="outline" className="flex items-center gap-2 border-border text-muted-foreground hover:text-foreground">
                        <Filter className="w-4 h-4" />
                        Year: 2024
                    </Button>
                </CardHeader>

                <div className="sm:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Member Name</th>
                                {recentMonths.map(month => (
                                    <th key={month.value} className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">{month.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {depositsGridData.map((member) => (
                                <tr
                                    key={member.id}
                                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/deposits/member/${member.id}`)}
                                >
                                    <td className="px-8 py-5">
                                        <Typography variant="p" className="font-semibold text-foreground">{member.name}</Typography>
                                        <Typography variant="small" className="text-[10px] text-muted-foreground uppercase truncate w-32 block">ID: {member.id}</Typography>
                                    </td>
                                    {member.records.map((paid, i) => (
                                        <td key={i} className="px-4 py-5 font-medium text-center">
                                            {paid ? (
                                                <div className="inline-flex items-center justify-center p-2 rounded-lg bg-success/10 text-success">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center justify-center p-2 rounded-lg bg-orange-400/10 text-orange-400">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden divide-y divide-border">
                    {depositsGridData.map((member) => (
                        <div key={member.id} className="p-4 space-y-4 bg-card active:bg-muted/30 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Typography variant="p" className="font-bold text-foreground">{member.name}</Typography>
                                    <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-bold truncate w-32 block">ID: {member.id}</Typography>
                                </div>
                                <div className="text-right">
                                    <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-black block mb-1">Active Fine</Typography>
                                    <Typography variant="p" className="text-xs font-bold text-destructive">NPR 0</Typography>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                {recentMonths.map((month, i) => {
                                    const paid = member.records[i];
                                    return (
                                        <div
                                            key={month.value}
                                            className={`
p-2 rounded-xl flex flex-col items-center justify-center gap-1 border
                                                ${paid ? 'bg-success/10 border-success/20' : 'bg-orange-400/10 border-orange-400/20'}
`}
                                        >
                                            <Typography variant="small" className={`text-[9px] font-black ${paid ? 'text-success' : 'text-orange-400'}`}>{month.label}</Typography>
                                            {paid ? (
                                                <CheckCircle2 className="w-3 h-3 text-success" />
                                            ) : (
                                                <Clock className="w-3 h-3 text-orange-400" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
