'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { RequireAdmin } from '@/features/auth/RequireAdmin';

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <RequireAdmin>
      <div className="admin-shell">
        <Sidebar />
        <div className="admin-main">
          <TopBar title={title} />
          <main className="admin-content">{children}</main>
        </div>
      </div>
    </RequireAdmin>
  );
}
