import { AdminShell } from '@/components/layout/AdminShell';
import { ConsultationDetailView } from '@/features/consultations/ConsultationDetailView';
import { messages } from '@/lib/i18n/en';

type Props = { params: Promise<{ id: string }> };

export default async function ConsultationDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminShell title={messages.consultations.detailTitle}>
      <ConsultationDetailView id={id} />
    </AdminShell>
  );
}
