import { AdminShell } from '@/components/layout/AdminShell';
import { AstrologerDetailView } from '@/features/astrologers/AstrologerDetailView';
import { messages } from '@/lib/i18n/en';

type Props = { params: Promise<{ id: string }> };

export default async function AstrologerDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminShell title={messages.astrologers.detailTitle}>
      <AstrologerDetailView id={id} />
    </AdminShell>
  );
}
