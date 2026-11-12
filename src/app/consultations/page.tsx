import { AdminShell } from '@/components/layout/AdminShell';
import { ConsultationsListView } from '@/features/consultations/ConsultationsListView';
import { messages } from '@/lib/i18n/en';

export default function ConsultationsPage() {
  return (
    <AdminShell title={messages.consultations.title}>
      <ConsultationsListView />
    </AdminShell>
  );
}
