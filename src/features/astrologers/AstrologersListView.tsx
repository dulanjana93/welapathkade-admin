'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import {
  ApplicationStatusBadge,
  ProfileStatusBadge,
} from '@/components/ui/StatusBadge';
import { astrologersApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/errors';
import { formatDateTime } from '@/lib/format';
import { messages } from '@/lib/i18n/en';
import type {
  AdminAstrologerListItem,
  AstrologerApplicationStatus,
} from '@/lib/types/api';

const FILTERS: Array<AstrologerApplicationStatus | 'ALL'> = [
  'ALL',
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
  'DRAFT',
];

export function AstrologersListView() {
  const [filter, setFilter] = useState<AstrologerApplicationStatus | 'ALL'>(
    'PENDING_REVIEW',
  );
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<AdminAstrologerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await astrologersApi.list(
        filter === 'ALL' ? undefined : filter,
      );
      setRows(data);
    } catch (err) {
      setRows([]);
      setError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return rows;
    }
    return rows.filter((row) => {
      const hay = [
        row.displayName,
        row.user.name,
        row.user.phone,
        row.city ?? '',
        row.district ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search]);

  return (
    <div className="stack">
      <div className="toolbar">
        <label className="field inline">
          <span>{messages.astrologers.filterLabel}</span>
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as AstrologerApplicationStatus | 'ALL')
            }
          >
            {FILTERS.map((value) => (
              <option key={value} value={value}>
                {value === 'ALL' ? messages.astrologers.filterAll : value}
              </option>
            ))}
          </select>
        </label>
        <label className="field grow">
          <span>{messages.astrologers.searchPlaceholder}</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={messages.astrologers.searchPlaceholder}
          />
          <span className="help">{messages.astrologers.searchHint}</span>
        </label>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          {messages.astrologers.refresh}
        </Button>
      </div>

      {loading ? <StateBlock kind="loading" /> : null}
      {!loading && error ? (
        <StateBlock kind="error" message={error} onRetry={() => void load()} />
      ) : null}
      {!loading && !error && visible.length === 0 ? (
        <StateBlock kind="empty" message={messages.astrologers.empty} />
      ) : null}

      {!loading && !error && visible.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{messages.astrologers.displayName}</th>
                <th>{messages.astrologers.phone}</th>
                <th>{messages.astrologers.applicationStatus}</th>
                <th>{messages.astrologers.profileStatus}</th>
                <th>{messages.astrologers.submitted}</th>
                <th>{messages.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.displayName}</strong>
                    <div className="muted tiny">{row.user.name}</div>
                  </td>
                  <td>{row.user.phone}</td>
                  <td>
                    {row.application ? (
                      <ApplicationStatusBadge status={row.application.status} />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <ProfileStatusBadge status={row.status} />
                  </td>
                  <td>{formatDateTime(row.application?.submittedAt)}</td>
                  <td>
                    <Link className="link-btn" href={`/astrologers/${row.id}`}>
                      {messages.astrologers.open}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
