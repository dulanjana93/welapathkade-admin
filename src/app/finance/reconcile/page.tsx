import { AdminShell } from '@/components/layout/AdminShell';
import { FinanceReconcileView } from '@/features/finance/FinanceReconcileView';
import { messages } from '@/lib/i18n/en';

export default function FinanceReconcilePage() {
  return (
    <AdminShell title={messages.finance.reconcileTitle}>
      <FinanceReconcileView />
    </AdminShell>
  );
}
