'use client';

import { AdminShell } from '@/components/layout/AdminShell';
import { messages } from '@/lib/i18n/en';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <AdminShell title={title}>
      <div className="panel">
        <h2>{messages.placeholder.title}</h2>
        <p className="muted">{messages.placeholder.body}</p>
      </div>
    </AdminShell>
  );
}
