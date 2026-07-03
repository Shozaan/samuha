import { useState } from 'react';
import { Typography, Button } from '@sujan77/ui-components';
import { CreditCard, Calendar, AlertCircle, CheckCircle2, Clock, ChevronRight, X } from 'lucide-react';
import { useGlobalStore } from '../../store/store';
import { usePendingRepayments, useMemberRepayments, useUpdateRepayment } from '../Loans/hooks/useLoans';

const fmt = (date: string | Date, opts?: Intl.DateTimeFormatOptions) =>
    new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', ...opts });

const isPast = (date: Date) => date < new Date();

const PAYMENT_MODES = ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE'];

const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
    PAID:    { label: 'Paid',    cls: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20', icon: CheckCircle2 },
    PENDING: { label: 'Pending', cls: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',   icon: Clock },
    LATE:    { label: 'Late',    cls: 'bg-red-500/10 text-red-600 border border-red-500/20',           icon: AlertCircle },
    PARTIAL: { label: 'Partial', cls: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',       icon: Clock },
    WAIVED:  { label: 'Waived',  cls: 'bg-purple-500/10 text-purple-600 border border-purple-500/20', icon: CheckCircle2 },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status] ?? statusConfig['PENDING'];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${cfg.cls}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
        </span>
    );
}

interface PayModalProps {
    repayment: any;
    onClose: () => void;
}

function PayModal({ repayment, onClose }: PayModalProps) {
    const [paymentMode, setPaymentMode] = useState('CASH');
    const updateRepayment = useUpdateRepayment();
    const { activeMemberId } = useGlobalStore();

    const handlePay = () => {
        updateRepayment.mutate({
            id: repayment.id,
            data: {
                status: 'PAID',
                paidDate: new Date(),
                paidAmount: Number(repayment.totalAmount),
                paymentMode,
                confirmedById: activeMemberId,
                confirmedAt: new Date(),
            }
        }, { onSuccess: onClose });
    };

    const memberName = repayment.loan?.member?.user?.name ?? '—';
    const loanNumber = repayment.loan?.loanNumber ?? '—';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <Typography variant="h4" className="font-black text-foreground">Confirm Payment</Typography>
                        <Typography variant="small" className="text-muted-foreground mt-1">
                            EMI #{repayment.emiNumber} — {memberName}
                        </Typography>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Loan</span>
                        <span className="text-sm font-semibold font-mono text-foreground">{loanNumber}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">EMI</span>
                        <span className="text-sm font-semibold text-foreground">#{repayment.emiNumber} of {repayment.loan?.durationMonths}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Due Date</span>
                        <span className="text-sm font-semibold text-foreground">
                            {fmt(repayment.dueDate)}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Amount</span>
                        <span className="text-base font-black text-emerald-600">NPR {Number(repayment.totalAmount).toLocaleString()}</span>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Payment Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                        {PAYMENT_MODES.map(mode => (
                            <button
                                key={mode}
                                onClick={() => setPaymentMode(mode)}
                                className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all ${
                                    paymentMode === mode
                                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                        : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                                }`}
                            >
                                {mode.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={handlePay}
                        disabled={updateRepayment.isLoading}
                    >
                        {updateRepayment.isLoading ? 'Processing...' : 'Mark as Paid'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Admin View ─────────────────────────────────────────────────────────────

function AdminRepayments() {
    const { activeGroupId } = useGlobalStore();
    const { data, isLoading } = usePendingRepayments(activeGroupId ?? undefined);
    const [payTarget, setPayTarget] = useState<any>(null);

    const repayments: any[] = data?.data ?? [];
    const late = repayments.filter(r => r.status === 'LATE' || isPast(new Date(r.dueDate)));
    const pending = repayments.filter(r => r.status === 'PENDING' && !isPast(new Date(r.dueDate)));
    const totalOutstanding = repayments.reduce((s, r) => s + Number(r.totalAmount), 0);

    return (
        <div className="space-y-8">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-2xl p-5">
                    <Typography variant="small" className="text-muted-foreground text-[11px] font-bold uppercase mb-2">Pending EMIs</Typography>
                    <p className="text-3xl font-black text-foreground">{pending.length}</p>
                    <Typography variant="small" className="text-muted-foreground text-xs mt-1">Due upcoming</Typography>
                </div>
                <div className="bg-card border border-red-500/20 rounded-2xl p-5">
                    <Typography variant="small" className="text-red-600 text-[11px] font-bold uppercase mb-2">Overdue EMIs</Typography>
                    <p className="text-3xl font-black text-red-600">{late.length}</p>
                    <Typography variant="small" className="text-muted-foreground text-xs mt-1">Past due date</Typography>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5">
                    <Typography variant="small" className="text-muted-foreground text-[11px] font-bold uppercase mb-2">Outstanding</Typography>
                    <p className="text-2xl font-black text-foreground">NPR {totalOutstanding.toLocaleString()}</p>
                    <Typography variant="small" className="text-muted-foreground text-xs mt-1">Total to collect</Typography>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <Typography variant="h5" className="font-black text-foreground">Pending EMI Collections</Typography>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-muted-foreground">Loading repayments...</div>
                ) : repayments.length === 0 ? (
                    <div className="p-12 text-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        <Typography variant="h5" className="font-bold text-foreground">All caught up!</Typography>
                        <Typography variant="small" className="text-muted-foreground mt-1">No pending or overdue EMIs.</Typography>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase text-muted-foreground">Member</th>
                                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase text-muted-foreground">Loan</th>
                                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase text-muted-foreground">EMI #</th>
                                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase text-muted-foreground">Due Date</th>
                                    <th className="px-6 py-3 text-right text-[11px] font-bold uppercase text-muted-foreground">Amount</th>
                                    <th className="px-6 py-3 text-center text-[11px] font-bold uppercase text-muted-foreground">Status</th>
                                    <th className="px-6 py-3 text-center text-[11px] font-bold uppercase text-muted-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {repayments.map((r: any) => {
                                    const overdue = isPast(new Date(r.dueDate)) && r.status !== 'PAID';
                                    return (
                                        <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-foreground">
                                                    {r.loan?.member?.user?.name ?? '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs text-muted-foreground">{r.loan?.loanNumber ?? '—'}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="font-bold text-foreground">{r.emiNumber}</span>
                                                <span className="text-muted-foreground text-xs"> / {r.loan?.durationMonths}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-medium ${overdue ? 'text-red-600' : 'text-foreground'}`}>
                                                    {fmt(r.dueDate)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-foreground">
                                                NPR {Number(r.totalAmount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <StatusBadge status={overdue && r.status !== 'PAID' ? 'LATE' : r.status} />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Button
                                                    size="sm"
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 h-auto rounded-lg"
                                                    onClick={() => setPayTarget(r)}
                                                >
                                                    Pay
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {payTarget && <PayModal repayment={payTarget} onClose={() => setPayTarget(null)} />}
        </div>
    );
}

// ─── Member View ─────────────────────────────────────────────────────────────

function MemberRepayments() {
    const { activeMemberId } = useGlobalStore();
    const { data, isLoading } = useMemberRepayments(activeMemberId ?? undefined);

    const repayments: any[] = data?.data ?? [];
    const loan = repayments[0]?.loan ?? null;

    const nextEmi = repayments.find(r => r.status === 'PENDING' || r.status === 'LATE');
    const paidCount = repayments.filter(r => r.status === 'PAID').length;
    const totalPaid = repayments.filter(r => r.status === 'PAID').reduce((s, r) => s + Number(r.paidAmount ?? r.totalAmount), 0);

    if (isLoading) return <div className="p-12 text-center text-muted-foreground">Loading your EMI schedule...</div>;

    if (!loan) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <CreditCard className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <Typography variant="h4" className="font-black text-foreground mb-2">No Active Loan</Typography>
                <Typography variant="small" className="text-muted-foreground">You don't have an active loan at the moment.</Typography>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Loan overview + Next EMI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Next EMI highlight */}
                {nextEmi ? (
                    <div className="md:col-span-1 bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="w-4 h-4 text-primary" />
                                <Typography variant="small" className="text-primary font-bold text-[11px] uppercase">Next EMI Due</Typography>
                            </div>
                            <p className="text-3xl font-black text-foreground">NPR {Number(nextEmi.totalAmount).toLocaleString()}</p>
                            <p className="text-sm font-semibold text-muted-foreground mt-1">
                                {fmt(nextEmi.dueDate, { weekday: 'long' })}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <StatusBadge status={isPast(new Date(nextEmi.dueDate)) ? 'LATE' : 'PENDING'} />
                            <span className="text-xs text-muted-foreground">EMI #{nextEmi.emiNumber} of {loan.durationMonths}</span>
                        </div>
                    </div>
                ) : (
                    <div className="md:col-span-1 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                        <Typography variant="h5" className="font-black text-foreground">Fully Paid!</Typography>
                        <Typography variant="small" className="text-muted-foreground mt-1">All EMIs completed.</Typography>
                    </div>
                )}

                {/* Loan summary cards */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <Typography variant="small" className="text-muted-foreground text-[11px] font-bold uppercase mb-2">Loan Amount</Typography>
                        <p className="text-xl font-black text-foreground">NPR {Number(loan.principalAmount).toLocaleString()}</p>
                        <Typography variant="small" className="text-xs text-muted-foreground mt-1 font-mono">{loan.loanNumber}</Typography>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <Typography variant="small" className="text-muted-foreground text-[11px] font-bold uppercase mb-2">Total Payable</Typography>
                        <p className="text-xl font-black text-foreground">NPR {Number(loan.totalAmount).toLocaleString()}</p>
                        <Typography variant="small" className="text-xs text-muted-foreground mt-1">{loan.durationMonths} months @ 12%</Typography>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <Typography variant="small" className="text-muted-foreground text-[11px] font-bold uppercase mb-2">EMIs Paid</Typography>
                        <p className="text-xl font-black text-emerald-600">{paidCount} / {loan.durationMonths}</p>
                        <Typography variant="small" className="text-xs text-muted-foreground mt-1">NPR {totalPaid.toLocaleString()} paid</Typography>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <Typography variant="small" className="text-muted-foreground text-[11px] font-bold uppercase mb-2">Monthly EMI</Typography>
                        <p className="text-xl font-black text-foreground">NPR {Number(loan.emiAmount).toLocaleString()}</p>
                        <Typography variant="small" className="text-xs text-muted-foreground mt-1">Fixed installment</Typography>
                    </div>
                </div>
            </div>

            {/* EMI schedule table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <Typography variant="h5" className="font-black text-foreground">EMI Schedule</Typography>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-6 py-3 text-center text-[11px] font-bold uppercase text-muted-foreground w-16">EMI #</th>
                                <th className="px-6 py-3 text-left text-[11px] font-bold uppercase text-muted-foreground">Due Date</th>
                                <th className="px-6 py-3 text-right text-[11px] font-bold uppercase text-muted-foreground">Principal</th>
                                <th className="px-6 py-3 text-right text-[11px] font-bold uppercase text-muted-foreground">Interest</th>
                                <th className="px-6 py-3 text-right text-[11px] font-bold uppercase text-muted-foreground">Total</th>
                                <th className="px-6 py-3 text-left text-[11px] font-bold uppercase text-muted-foreground">Paid Date</th>
                                <th className="px-6 py-3 text-center text-[11px] font-bold uppercase text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {repayments.map((r: any) => {
                                const isNext = r.id === nextEmi?.id;
                                const overdue = isPast(new Date(r.dueDate)) && r.status === 'PENDING';
                                return (
                                    <tr
                                        key={r.id}
                                        className={`border-b border-border/50 transition-colors ${
                                            isNext ? 'bg-primary/5' : 'hover:bg-muted/20'
                                        }`}
                                    >
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-black ${isNext ? 'text-primary' : 'text-foreground'}`}>
                                                {r.emiNumber}
                                            </span>
                                            {isNext && <ChevronRight className="w-3 h-3 text-primary inline ml-1" />}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-medium ${overdue ? 'text-red-600' : 'text-foreground'}`}>
                                                {format(new Date(r.dueDate), 'dd MMM yyyy')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-muted-foreground">
                                            NPR {Number(r.principalAmount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-muted-foreground">
                                            NPR {Number(r.interestAmount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-foreground">
                                            NPR {Number(r.totalAmount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {r.paidDate ? fmt(r.paidDate) : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={overdue ? 'LATE' : r.status} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RepaymentsPage() {
    const { role } = useGlobalStore();
    const isAdmin = role?.toUpperCase() === 'ADMIN' || role?.toUpperCase() === 'SECONDARY_ADMIN';

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <Typography variant="h3" className="font-black text-foreground">
                        {isAdmin ? 'Repayment Collections' : 'My EMI Schedule'}
                    </Typography>
                    <Typography variant="small" className="text-muted-foreground">
                        {isAdmin
                            ? 'View and collect pending loan EMIs from members'
                            : 'Track your loan installments and upcoming payments'}
                    </Typography>
                </div>
            </div>

            {isAdmin ? <AdminRepayments /> : <MemberRepayments />}
        </div>
    );
}
