-- AlterTable
ALTER TABLE "group_rules" ADD COLUMN     "allowedLoanTenures" TEXT,
ADD COLUMN     "emiPaymentDay" INTEGER,
ADD COLUMN     "lateDepositFineAmount" DECIMAL(10,2),
ADD COLUMN     "lateEmiPenaltyPercent" DECIMAL(5,2),
ADD COLUMN     "loanDefaultPenaltyPercent" DECIMAL(5,2),
ADD COLUMN     "loanProcessingFeePercent" DECIMAL(5,2),
ADD COLUMN     "minDepositMonths" INTEGER,
ADD COLUMN     "registrationFee" DECIMAL(10,2),
ADD COLUMN     "savingsToLoanRatio" DECIMAL(5,2);
