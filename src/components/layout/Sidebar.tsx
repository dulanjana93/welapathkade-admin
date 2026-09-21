'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { messages } from '@/lib/i18n/en';

type NavItem = {
  href: string;
  label: string;
  enabled: boolean;
};

const NAV: NavItem[] = [
  { href: '/dashboard', label: messages.nav.dashboard, enabled: true },
  { href: '/astrologers', label: messages.nav.astrologers, enabled: true },
  { href: '/services', label: messages.nav.services, enabled: true },
  { href: '/users', label: messages.nav.users, enabled: true },
  { href: '/consultations', label: messages.nav.consultations, enabled: false },
  { href: '/payments', label: messages.nav.payments, enabled: false },
  { href: '/referrals', label: messages.nav.referrals, enabled: false },
  { href: '/settings', label: messages.nav.settings, enabled: false },
  { href: '/audit-logs', label: messages.nav.auditLogs, enabled: false },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">W</span>
        <div>
          <strong>{messages.appName}</strong>
          <p className="muted tiny">Admin console</p>
        </div>
      </div>
      <nav className="sidebar-nav" aria-label="Main">
        {NAV.map((item) => {
          const active =
            item.enabled &&
            (pathname === item.href || pathname.startsWith(`${item.href}/`));

          if (!item.enabled) {
            return (
              <span
                key={item.href}
                className="nav-item nav-item-disabled"
                title={messages.nav.comingLater}
              >
                {item.label}
                <em>{messages.nav.comingLater}</em>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${active ? ' active' : ''}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
