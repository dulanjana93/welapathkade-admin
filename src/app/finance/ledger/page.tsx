import { Suspense } from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { FinanceLedgerView } from '@/features/finance/FinanceLedgerView';
import { messages } from '@/lib/i18n/en';

export default function FinanceLedgerPage() {
  return (
    <AdminShell title={messages.finance.ledgerTitle}>
      <Suspense fallback={<p className="muted">{messages.common.loading}</p>}>
        <FinanceLedgerView />
      </Suspense>
    </AdminShell>
  );
}
