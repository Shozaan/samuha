import { Card, CardHeader, CardTitle, CardContent, Typography, Button } from '@sujan77/ui-components';
import { CheckCircle2, Info } from 'lucide-react';

interface LoanNextPaymentProps {
    nextEMIStr: string;
    emiAmountStr: string;
    isAdmin: boolean;
    isAwaitingApproval: boolean;
    hasNextRepayment: boolean;
    isPending: boolean;
    onAdminApproval: () => void;
    onOpenPayModal: () => void;
    isActive: boolean;
}

export function LoanNextPayment({
    nextEMIStr,
    emiAmountStr,
    isAdmin,
    isAwaitingApproval,
    hasNextRepayment,
    isPending,
    onAdminApproval,
    onOpenPayModal,
    isActive
}: LoanNextPaymentProps) {
    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">Next Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-6 rounded-2xl bg-muted/50 border border-border text-center">
                    <Typography variant="small" className="text-muted-foreground font-bold block mb-1">Due on {nextEMIStr}</Typography>
                    <Typography variant="h2" className="text-3xl font-black text-foreground">NPR {emiAmountStr}</Typography>
                </div>
                {isAdmin && (
                    <Button 
                        onClick={onAdminApproval}
                        disabled={!hasNextRepayment || isPending || !isActive}
                        className={`w-full font-bold py-6 rounded-xl flex items-center justify-center gap-2 shadow-lg ${isAwaitingApproval ? 'bg-warning hover:bg-warning/90 text-white shadow-warning/20' : 'bg-primary text-primary-foreground shadow-primary/20'}`}
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        {isPending ? 'Processing...' : !isActive ? 'Awaiting Disbursement' : hasNextRepayment ? (isAwaitingApproval ? 'Approve Payment' : 'Mark as Paid directly') : 'All Paid'}
                    </Button>
                )}
                <Button 
                    variant={isAdmin ? "outline" : "default"}
                    onClick={() => !isAwaitingApproval && onOpenPayModal()}
                    disabled={!hasNextRepayment || isPending || isAwaitingApproval || !isActive}
                    className={`w-full font-bold py-6 rounded-xl flex items-center justify-center gap-2 ${!isAdmin ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'border-2 border-border border-dashed'}`}
                >
                    <CheckCircle2 className="w-5 h-5" />
                    {!isActive ? 'Awaiting Disbursement' : isAwaitingApproval ? 'Awaiting Admin Approval' : hasNextRepayment ? 'Pay Installment' : 'All Paid'}
                </Button>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-info/5 p-3 rounded-lg border border-info/20">
                    <Info className="w-4 h-4 text-info flex-shrink-0" />
                    <p>Ensure you have the cash/check before marking this as paid.</p>
                </div>
            </CardContent>
        </Card>
    );
}
