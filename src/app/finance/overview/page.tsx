import { AdminShell } from '@/components/layout/AdminShell';
import { FinanceOverviewView } from '@/features/finance/FinanceOverviewView';
import { messages } from '@/lib/i18n/en';

export default function FinanceOverviewPage() {
  return (
    <AdminShell title={messages.finance.overviewTitle}>
      <FinanceOverviewView />
    </AdminShell>
  );
}
