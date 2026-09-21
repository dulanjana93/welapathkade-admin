import { AdminShell } from '@/components/layout/AdminShell';
import { UserDetailView } from '@/features/users/UserDetailView';
import { messages } from '@/lib/i18n/en';

type Props = { params: Promise<{ id: string }> };

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminShell title={messages.users.detailTitle}>
      <UserDetailView id={id} />
    </AdminShell>
  );
}
