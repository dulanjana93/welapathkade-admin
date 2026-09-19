import { AdminShell } from '@/components/layout/AdminShell';
import { ServicesView } from '@/features/services/ServicesView';
import { messages } from '@/lib/i18n/en';

export default function ServicesPage() {
  return (
    <AdminShell title={messages.services.title}>
      <ServicesView />
    </AdminShell>
  );
}
