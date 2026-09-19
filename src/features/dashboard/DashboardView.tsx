'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { StateBlock } from '@/components/ui/StateBlock';
import { astrologersApi, servicesApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/errors';
import { messages } from '@/lib/i18n/en';

type Stats = {
  totalAstrologers: number;
  pendingApplications: number;
  activeAstrologers: number;
  services: number;
};

export function DashboardView() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [astrologers, services] = await Promise.all([
        astrologersApi.list(),
        servicesApi.list(),
      ]);
      setStats({
        totalAstrologers: astrologers.length,
        pendingApplications: astrologers.filter(
          (a) => a.application?.status === 'PENDING_REVIEW',
        ).length,
        activeAstrologers: astrologers.filter((a) => a.status === 'ACTIVE').length,
        services: services.length,
      });
    } catch (err) {
      setStats(null);
      setError(err instanceof ApiError ? err.message : messages.dashboard.noStats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <StateBlock kind="loading" />;
  }

  if (error || !stats) {
    return <StateBlock kind="error" message={error ?? messages.dashboard.noStats} onRetry={() => void load()} />;
  }

  const cards = [
    { label: messages.dashboard.totalAstrologers, value: stats.totalAstrologers },
    { label: messages.dashboard.pendingApplications, value: stats.pendingApplications },
    { label: messages.dashboard.activeAstrologers, value: stats.activeAstrologers },
    { label: messages.dashboard.services, value: stats.services },
  ];

  return (
    <div className="stack">
      <Alert tone="info">{messages.dashboard.hint}</Alert>
      <div className="stat-grid">
        {cards.map((card) => (
          <div key={card.label} className="stat-card">
            <p className="muted">{card.label}</p>
            <strong className="stat-value">{card.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
