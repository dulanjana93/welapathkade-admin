import { AdminShell } from '@/components/layout/AdminShell';
import { UsersListView } from '@/features/users/UsersListView';
import { messages } from '@/lib/i18n/en';

export default function UsersPage() {
  return (
    <AdminShell title={messages.users.title}>
      <UsersListView />
    </AdminShell>
  );
}
