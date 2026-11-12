import { AdminShell } from '@/components/layout/AdminShell';
import { FinanceWithdrawalsView } from '@/features/finance/FinanceWithdrawalsView';
import { messages } from '@/lib/i18n/en';

export default function ReferralPayoutsPage() {
  return (
    <AdminShell title={messages.finance.payoutPurposeCustomer}>
      <FinanceWithdrawalsView purpose="CUSTOMER_REFERRAL" />
    </AdminShell>
  );
}
