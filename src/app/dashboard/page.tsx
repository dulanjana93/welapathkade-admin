import { AdminShell } from '@/components/layout/AdminShell';
import { DashboardView } from '@/features/dashboard/DashboardView';
import { messages } from '@/lib/i18n/en';

export default function DashboardPage() {
  return (
    <AdminShell title={messages.dashboard.title}>
      <DashboardView />
    </AdminShell>
  );
}
