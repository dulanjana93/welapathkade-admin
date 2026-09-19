'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { messages } from '@/lib/i18n/en';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(pathname || '/dashboard');
      router.replace(`/login?next=${next}`);
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="center-screen">
        <p className="muted">{messages.common.loading}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="center-screen">
        <p className="muted">{messages.login.loginRequired}</p>
      </div>
    );
  }

  return <>{children}</>;
}
