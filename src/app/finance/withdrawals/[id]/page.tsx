import { AdminShell } from '@/components/layout/AdminShell';
import { FinanceWithdrawalDetailView } from '@/features/finance/FinanceWithdrawalDetailView';
import { messages } from '@/lib/i18n/en';

type Props = { params: Promise<{ id: string }> };

export default async function FinanceWithdrawalDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminShell title={messages.finance.withdrawalDetailTitle}>
      <FinanceWithdrawalDetailView id={id} />
    </AdminShell>
  );
}
