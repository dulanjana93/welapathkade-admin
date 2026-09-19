import { AdminShell } from '@/components/layout/AdminShell';
import { AstrologersListView } from '@/features/astrologers/AstrologersListView';
import { messages } from '@/lib/i18n/en';

export default function AstrologersPage() {
  return (
    <AdminShell title={messages.astrologers.title}>
      <AstrologersListView />
    </AdminShell>
  );
}
