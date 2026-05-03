import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLoanById, useUpdateRepayment } from './hooks/useLoans';
import { useGlobalStore } from '../../store/store';
import { PayEmiModal } from './components/PayEmiModal';
import {
    ArrowLeft,
    Download,
    Printer,
} from 'lucide-react';
import { Button, Typography } from '@sujan77/ui-components';
import { LoanHeaderSummary } from './components/LoanHeaderSummary';
import { LoanRepaymentSchedule } from './components/LoanRepaymentSchedule';
import { LoanNextPayment } from './components/LoanNextPayment';
import { LoanDocuments } from './components/LoanDocuments';

export default function LoanDetails() {
    const { loanId } = useParams();
    const navigate = useNavigate();
    const { role, activeMemberId } = useGlobalStore();
    const isGlobalAdmin = role?.toUpperCase() === 'ADMIN' || role?.toUpperCase() === 'SECONDARY_ADMIN';

    const { data: response, isLoading } = useLoanById(loanId);
    const loan = response?.data;
    const updateRepayment = useUpdateRepayment();
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);

    if (isLoading) {
        return <div className="p-8 text-center"><Typography variant="muted">Loading loan details...</Typography></div>;
    }

    if (!loan) {
        return <div className="p-8 text-center"><Typography variant="p" className="text-destructive font-bold">Loan not found</Typography></div>;
    }

    const isOwnLoan = loan.memberId === activeMemberId;
    const canApprove = isGlobalAdmin && !isOwnLoan;

    const memberName = loan.member?.user?.name || 'Unknown Member';
    const amountStr = parseFloat(loan.principalAmount).toLocaleString();
    const interestStr = loan.interestRate + '%';
    const termStr = loan.durationMonths + ' Months';
    const startDateStr = loan.disbursedAt ? new Date(loan.disbursedAt).toLocaleDateString() : 'Not Yet Disbursed';

    // Repayments calculations
    const repayments = loan.repayments || [];
    const hasGeneratedRepayments = repayments.length > 0;

    const totalPaid = repayments.reduce((sum: number, r: any) => sum + (r.paidAmount ? parseFloat(r.paidAmount) : 0), 0);
    const totalLoanAmountRaw = parseFloat(loan.totalAmount);
    const remainingBalance = Math.max(0, totalLoanAmountRaw - totalPaid);

    const paidStr = totalPaid.toLocaleString();
    const remainingStr = remainingBalance.toLocaleString();
    const paidPercentage = totalLoanAmountRaw > 0 ? (totalPaid / totalLoanAmountRaw) * 100 : 0;

    const nextRepayment = repayments.find((r: any) => r.status === 'PENDING' || r.status === 'LATE');
    
    // Determine the logical status text if the loan is not active
    const isActive = loan.status === 'ACTIVE' || loan.status === 'COMPLETED' || loan.status === 'DEFAULTED';
    let nextEMIStr = 'N/A';
    if (!isActive) nextEMIStr = 'Pending Disbursement';
    else if (nextRepayment) nextEMIStr = new Date(nextRepayment.dueDate).toLocaleDateString();
    
    const emiAmountStr = parseFloat(loan.emiAmount).toLocaleString();

    // For when there are no generated repayments yet (Before active)
    const schedule = hasGeneratedRepayments ? repayments.map((r: any) => ({
        month: `EMI #${r.emiNumber}`,
        amount: parseFloat(r.totalAmount).toLocaleString(),
        status: r.status,
        date: r.dueDate ? new Date(r.dueDate).toLocaleDateString() : 'TBD'
    })) : [];

    const handlePaySubmit = (data: { paidAmount: number, paymentMode: string, notes: string }) => {
        if (!nextRepayment) return;
        updateRepayment.mutate({
            id: nextRepayment.id,
            data: {
                ...data,
                paidDate: new Date() // Sets paidDate but preserves PENDING status
            }
        });
    };

    const handleAdminApproval = () => {
        if (!nextRepayment) return;
        if (window.confirm(nextRepayment.paidDate ? `Approve Member's Payment for EMI due on ${nextEMIStr}?` : `Directly Mark EMI due on ${nextEMIStr} as PAID?`)) {
            updateRepayment.mutate({
                id: nextRepayment.id,
                data: {
                    status: 'PAID',
                    paidDate: nextRepayment.paidDate || new Date(),
                    paidAmount: nextRepayment.paidAmount || nextRepayment.totalAmount
                }
            });
        }
    };

    const isAwaitingApproval = nextRepayment && !!nextRepayment.paidDate && nextRepayment.status === 'PENDING';

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
            <PayEmiModal
                isOpen={isPayModalOpen}
                onClose={() => setIsPayModalOpen(false)}
                onSubmit={handlePaySubmit}
                expectedAmount={parseFloat(loan.emiAmount)}
            />

            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/loans')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Portfolio
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-border text-muted-foreground flex items-center gap-2">
                        <Printer className="w-4 h-4" />
                        Print
                    </Button>
                    <Button className="bg-primary text-primary-foreground font-bold shadow-md flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Statement
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-3 space-y-8">
                    <LoanHeaderSummary
                        memberName={memberName}
                        loanNumber={loan.loanNumber}
                        status={loan.status}
                        termStr={termStr}
                        startDateStr={startDateStr}
                        amountStr={amountStr}
                        paidStr={paidStr}
                        paidPercentage={paidPercentage}
                        remainingStr={remainingStr}
                        interestStr={interestStr}
                        interestType={loan.interestType}
                    />

                    <LoanRepaymentSchedule schedule={schedule} />
                </div>

                <div className="space-y-6">
                    <LoanNextPayment
                        nextEMIStr={nextEMIStr}
                        emiAmountStr={emiAmountStr}
                        isAdmin={canApprove}
                        isAwaitingApproval={isAwaitingApproval!}
                        hasNextRepayment={!!nextRepayment}
                        isPending={updateRepayment.isPending}
                        onAdminApproval={handleAdminApproval}
                        onOpenPayModal={() => setIsPayModalOpen(true)}
                        isActive={isActive}
                    />

                    <LoanDocuments />
                </div>
            </div>
        </div>
    );
}
