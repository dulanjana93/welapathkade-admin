import { AdminShell } from '@/components/layout/AdminShell';
import { FinanceAttentionCasesView } from '@/features/finance/FinanceAttentionCasesView';
import { messages } from '@/lib/i18n/en';

export default function FinanceAttentionCasesPage() {
  return (
    <AdminShell title={messages.finance.attentionTitle}>
      <FinanceAttentionCasesView />
    </AdminShell>
  );
}
