import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    TrendingUp,
    AlertCircle,
    Landmark,
    CalendarX,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Button,
    Typography,
    Avatar,
    AvatarFallback
} from '@sujan77/ui-components';
import { useGlobalStore } from '../../store/store';
import { useLoans, useCreateLoan, useUpdateLoan } from './hooks/useLoans';
import { MakeLoanModal } from './components/MakeLoanModal';
import type { LoanPostData } from './types';

export default function LoansList() {
    const navigate = useNavigate();
    const { activeGroupId, activeMemberId, role } = useGlobalStore();
    const isAdmin = role?.toUpperCase() === 'ADMIN' || role?.toUpperCase() === 'SECONDARY_ADMIN';
    const [isMakeModalOpen, setIsMakeModalOpen] = useState(false);

    const { data: loansResponse } = useLoans({ groupId: activeGroupId || '', limit: 1000 });
    const allLoans = loansResponse?.data || [];

    const createLoan = useCreateLoan();
    const updateLoan = useUpdateLoan();

    // Data partitioning
    const activeLoans = allLoans.filter((l: any) => l.status === 'ACTIVE' || l.status === 'DISBURSED');
    const loanRequests = allLoans.filter((l: any) => l.status === 'REQUESTED' || l.status === 'APPROVED');
    
    // Auth logic
    const hasActiveLoan = allLoans.some((l: any) => l.memberId === activeMemberId && ['REQUESTED', 'APPROVED', 'DISBURSED', 'ACTIVE'].includes(l.status));

    // Stats
    const totalOut = activeLoans.reduce((sum: number, l: any) => sum + parseFloat(l.principalAmount), 0);
    const expectedEmi = activeLoans.reduce((sum: number, l: any) => sum + parseFloat(l.emiAmount), 0);

    // Missed EMI deadlines for the logged-in member
    const now = new Date();
    const myLoansAll = allLoans.filter((l: any) => l.memberId === activeMemberId);
    const missedEmiDeadlines = myLoansAll.flatMap((l: any) =>
        (l.repayments || [])
            .filter((r: any) => r.status === 'PENDING' && new Date(r.dueDate) < now)
            .map((r: any) => ({
                ...r,
                loanNumber: l.loanNumber,
                loanId: l.id,
                daysOverdue: Math.floor((now.getTime() - new Date(r.dueDate).getTime()) / 86400000),
                fine: parseFloat(r.fineAmount || r.penaltyAmount || '0'),
            }))
    ).sort((a: any, b: any) => b.daysOverdue - a.daysOverdue);
    const totalEmiMissedFines = missedEmiDeadlines.reduce((s: number, r: any) => s + r.fine, 0);

    const handleRequestLoan = (data: LoanPostData) => {
        createLoan.mutate(data);
    };

    const handleApprove = (id: string) => {
        if (window.confirm("Approve this loan request?")) {
            updateLoan.mutate({ id, data: { status: 'APPROVED', approvedById: activeMemberId || undefined } });
        }
    };

    const handleDisburse = (id: string) => {
        if (window.confirm("Mark this loan as disbursed to the member? It will become ACTIVE.")) {
            updateLoan.mutate({ id, data: { status: 'ACTIVE', disbursedAt: new Date() } });
        }
    };

    const handleReviewOption = () => {
        // Feature to review detailed application in future
        alert("Detailed loan review feature coming soon!");
    };


    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Typography variant="h2" className="text-3xl font-bold text-foreground">Loan Portfolio</Typography>
                    <Typography variant="muted">Manage group loans, repayment schedules and new requests.</Typography>
                </div>
                <Button 
                    onClick={() => setIsMakeModalOpen(true)}
                    disabled={hasActiveLoan}
                    className={`flex items-center gap-2 font-bold shadow-md ${hasActiveLoan ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}`}
                >
                    <Plus className="w-4 h-4" />
                    {hasActiveLoan ? 'Active Loan Exists' : 'New Loan Request'}
                </Button>
            </div>

            <MakeLoanModal
                isOpen={isMakeModalOpen}
                onClose={() => setIsMakeModalOpen(false)}
                onSubmit={handleRequestLoan}
            />

            {/* ── My Loans Section ── */}
            {activeMemberId && (() => {
                const myLoans = allLoans.filter((l: any) => l.memberId === activeMemberId);
                if (myLoans.length === 0) return null;
                return (
                    <Card className="border-primary/20 bg-primary/5 overflow-hidden">
                        <CardHeader className="p-6 border-b border-primary/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                    <Landmark className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">My Loans</CardTitle>
                                    <Typography variant="small" className="text-muted-foreground text-xs">Your active and past loan history — click to view details</Typography>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {myLoans.map((loan: any) => {
                                    const repayments = loan.repayments || [];
                                    const totalPaid = repayments.reduce((s: number, r: any) => s + (r.paidAmount ? parseFloat(r.paidAmount) : 0), 0);
                                    const totalLoan = parseFloat(loan.totalAmount || '0');
                                    const progress = totalLoan > 0 ? Math.min(100, Math.round((totalPaid / totalLoan) * 100)) : 0;
                                    const isActive = ['ACTIVE', 'DISBURSED', 'APPROVED'].includes(loan.status);
                                    return (
                                        <div
                                            key={loan.id}
                                            className="px-6 py-4 hover:bg-primary/5 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/loans/${loan.id}`)}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <Typography variant="p" className="font-bold text-foreground text-sm">{loan.loanNumber}</Typography>
                                                    <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-bold">{loan.durationMonths} months • {loan.interestRate}% interest</Typography>
                                                </div>
                                                <div className="text-right">
                                                    <Typography variant="p" className="font-black text-foreground">NPR {parseFloat(loan.principalAmount).toLocaleString()}</Typography>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border inline-block mt-0.5 ${
                                                        isActive ? 'bg-warning/10 text-warning border-warning/20' :
                                                        loan.status === 'COMPLETED' ? 'bg-success/10 text-success border-success/20' :
                                                        loan.status === 'REQUESTED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                        'bg-muted text-muted-foreground border-border'
                                                    }`}>{loan.status}</span>
                                                </div>
                                            </div>
                                            {isActive && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                                        <span className="text-muted-foreground">Repaid</span>
                                                        <span className="text-primary">{progress}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                );
            })()}

            {/* ── Missed EMI Deadlines ── */}
            {activeMemberId && missedEmiDeadlines.length > 0 && (
                <Card className="border-destructive/30 bg-destructive/5 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <CardHeader className="p-5 border-b border-destructive/20 bg-destructive/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-destructive/15 rounded-xl">
                                    <CalendarX className="w-5 h-5 text-destructive" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
                                        Missed EMI Deadlines
                                        <span className="text-[10px] bg-destructive text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                            {missedEmiDeadlines.length} Overdue
                                        </span>
                                    </CardTitle>
                                    <Typography variant="small" className="text-destructive/70 text-xs">Pay your EMIs immediately to avoid penalty escalation</Typography>
                                </div>
                            </div>
                            {totalEmiMissedFines > 0 && (
                                <div className="text-right">
                                    <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-black block">Total Penalties Accrued</Typography>
                                    <Typography variant="p" className="font-black text-destructive text-lg">NPR {totalEmiMissedFines.toLocaleString()}</Typography>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-destructive/10">
                            {missedEmiDeadlines.map((r: any) => (
                                <div
                                    key={r.id}
                                    className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-destructive/5 transition-colors"
                                    onClick={() => navigate(`/loans/${r.loanId}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-destructive/10 rounded-xl">
                                            <AlertCircle className="w-4 h-4 text-destructive" />
                                        </div>
                                        <div>
                                            <Typography variant="p" className="font-bold text-foreground text-sm">
                                                EMI #{r.emiNumber} &nbsp;·&nbsp; {r.loanNumber}
                                            </Typography>
                                            <Typography variant="small" className="text-[10px] text-destructive font-black uppercase tracking-wider">
                                                Due {new Date(r.dueDate).toLocaleDateString()} &nbsp;·&nbsp; {r.daysOverdue} day{r.daysOverdue !== 1 ? 's' : ''} overdue
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <Typography variant="p" className="font-bold text-foreground text-sm">NPR {parseFloat(r.totalAmount).toLocaleString()}</Typography>
                                        {r.fine > 0 && (
                                            <span className="text-[10px] font-black text-white bg-destructive px-2.5 py-0.5 rounded-full block">
                                                Fine: NPR {r.fine.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border bg-card">
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                <CardTitle className="text-xl font-bold">Active Loans</CardTitle>
                            </div>
                            <div className="flex items-center gap-4 bg-muted px-4 py-1.5 rounded-xl border border-border w-full md:w-64 focus-within:border-primary/50 transition-all">
                                <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
                                <Input
                                    placeholder="Search loans..."
                                    className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {activeLoans.map((loan: any) => {
                                    const memberName = loan.member?.user?.name || 'Unknown Member';
                                    const repayments = loan.repayments || [];
                                    const totalPaid = repayments.reduce((sum: number, r: any) => sum + (r.paidAmount ? parseFloat(r.paidAmount) : 0), 0);
                                    const totalLoanAmountRaw = parseFloat(loan.totalAmount || "0");
                                    const progress = totalLoanAmountRaw > 0 ? Math.min(100, Math.round((totalPaid / totalLoanAmountRaw) * 100)) : 0;

                                    return (
                                        <div
                                            key={loan.id}
                                            className="p-6 hover:bg-muted/30 cursor-pointer transition-all group"
                                            onClick={() => navigate(`/loans/${loan.id}`)}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="w-10 h-10 border border-border bg-muted">
                                                        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary uppercase">
                                                            {memberName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <Typography variant="p" className="font-bold text-foreground group-hover:text-primary transition-colors">{memberName}</Typography>
                                                        <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">ID: {loan.loanNumber} • {loan.interestRate}% Interest</Typography>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Typography variant="h4" className="text-xl font-black text-foreground">NPR {parseFloat(loan.principalAmount).toLocaleString()}</Typography>
                                                    <Typography variant="small" className="text-xs text-muted-foreground">{loan.durationMonths} Term</Typography>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                                    <span className="text-muted-foreground">Repayment Progress</span>
                                                    <span className="text-primary">{progress}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progress}% ` }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {activeLoans.length === 0 && (
                                    <div className="p-8 text-center bg-muted/10 border border-dashed border-border rounded-xl m-4">
                                        <Landmark className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <Typography variant="p" className="font-bold text-foreground">No active loans.</Typography>
                                        <Typography variant="small" className="text-xs text-muted-foreground">The group has no active loans to display.</Typography>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-muted/20 text-center border-t border-border">
                                <Button variant="ghost" className="text-xs font-bold text-primary uppercase tracking-widest">View Closed Loans</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-primary/20 bg-primary/5 shadow-none">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-primary" />
                                <CardTitle className="text-xl font-bold">New Requests</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loanRequests.map((req: any) => {
                                const memberName = req.member?.user?.name || 'Unknown Member';
                                return (
                                    <div key={req.id} className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between">
                                            <Typography variant="small" className="font-bold text-foreground">{memberName}</Typography>
                                            <Typography variant="small" className="text-[10px] text-muted-foreground uppercase font-bold text-right ml-2">{new Date(req.createdAt).toLocaleDateString()}</Typography>
                                        </div>
                                        <Typography variant="h4" className="text-lg font-black text-foreground">NPR {parseFloat(req.principalAmount).toLocaleString()}</Typography>
                                        {req.purpose && <Typography variant="small" className="text-xs text-muted-foreground line-clamp-1 italic">"{req.purpose}"</Typography>}
                                        {isAdmin && (
                                            <div className="flex gap-2 pt-2 animate-in slide-in-from-bottom-2 duration-300">
                                                {req.status === 'REQUESTED' ? (
                                                    <>
                                                        <Button variant="outline" onClick={handleReviewOption} className="flex-1 text-[10px] font-bold uppercase py-1 h-8 rounded-lg border-border">Review</Button>
                                                        <Button onClick={() => handleApprove(req.id)} className="flex-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase py-1 h-8 rounded-lg shadow-sm">Approve</Button>
                                                    </>
                                                ) : req.status === 'APPROVED' ? (
                                                    <Button onClick={() => handleDisburse(req.id)} className="w-full bg-success text-white text-[10px] font-bold uppercase py-1 h-8 rounded-lg shadow-sm">Mark Disbursed</Button>
                                                ) : null}
                                            </div>
                                        )}
                                        {!isAdmin && (
                                            <div className="pt-2">
                                                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest bg-warning/10 text-warning">
                                                    {req.status === 'APPROVED' ? 'Approved, Pending Disbursement' : 'Pending Admin Review'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                            {loanRequests.length === 0 && (
                                <div className="p-6 text-center text-muted-foreground">
                                    <Typography variant="small" className="text-xs font-medium">No pending requests.</Typography>
                                </div>
                            )}
                            <Button variant="ghost" className="w-full text-xs font-bold text-primary uppercase tracking-widest mt-2">See all requests</Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Quick Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm p-3 rounded-xl bg-muted/30">
                                <span className="text-muted-foreground">Total Out on Loans</span>
                                <span className="font-bold text-foreground">NPR {totalOut.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-3 rounded-xl bg-muted/30">
                                <span className="text-muted-foreground">Expected EMI / Month</span>
                                <span className="font-bold text-foreground">NPR {expectedEmi.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
