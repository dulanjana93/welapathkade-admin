import { AdminShell } from '@/components/layout/AdminShell';
import { FinanceWithdrawalsView } from '@/features/finance/FinanceWithdrawalsView';
import { messages } from '@/lib/i18n/en';

export default function FinanceWithdrawalsPage() {
  return (
    <AdminShell title={messages.finance.withdrawalsTitle}>
      <FinanceWithdrawalsView />
    </AdminShell>
  );
}
