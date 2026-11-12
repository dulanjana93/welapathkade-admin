import { AdminShell } from '@/components/layout/AdminShell';
import { ReferralsView } from '@/features/referrals/ReferralsView';
import { messages } from '@/lib/i18n/en';

export default function ReferralsPage() {
  return (
    <AdminShell title={messages.referrals.title}>
      <ReferralsView />
    </AdminShell>
  );
}
