'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { messages } from '@/lib/i18n/en';

export function TopBar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        {user ? (
          <div className="admin-chip">
            <strong>{user.name}</strong>
            <span className="muted">{user.email || user.phone}</span>
          </div>
        ) : null}
        <button type="button" className="btn btn-ghost" onClick={() => void onLogout()}>
          {messages.nav.logout}
        </button>
      </div>
    </header>
  );
}
