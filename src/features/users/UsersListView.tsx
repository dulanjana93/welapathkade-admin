'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { UserRoleBadge, UserStatusBadge } from '@/components/ui/StatusBadge';
import { usersApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/errors';
import { formatDateTime } from '@/lib/format';
import { messages } from '@/lib/i18n/en';
import type { AdminUserListItem, UserRole, UserStatus } from '@/lib/types/api';

const ROLE_FILTERS: Array<UserRole | 'ALL'> = [
  'ALL',
  'PUBLIC',
  'ASTROLOGER',
  'ADMIN',
];

const STATUS_FILTERS: Array<UserStatus | 'ALL'> = [
  'ALL',
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
];

export function UsersListView() {
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.list({
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setRows(data);
    } catch (err) {
      setRows([]);
      setError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return rows;
    }
    return rows.filter((row) => {
      const hay = [row.name, row.phone, row.email ?? '', row.referralCode]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search]);

  return (
    <div className="stack">
      <div className="toolbar">
        <label className="field inline">
          <span>{messages.users.roleFilter}</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
          >
            {ROLE_FILTERS.map((value) => (
              <option key={value} value={value}>
                {value === 'ALL' ? messages.users.filterAll : value}
              </option>
            ))}
          </select>
        </label>
        <label className="field inline">
          <span>{messages.users.statusFilter}</span>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as UserStatus | 'ALL')
            }
          >
            {STATUS_FILTERS.map((value) => (
              <option key={value} value={value}>
                {value === 'ALL' ? messages.users.filterAll : value}
              </option>
            ))}
          </select>
        </label>
        <label className="field grow">
          <span>{messages.users.searchPlaceholder}</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={messages.users.searchPlaceholder}
          />
          <span className="help">{messages.users.searchHint}</span>
        </label>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          {messages.users.refresh}
        </Button>
      </div>

      {loading ? <StateBlock kind="loading" /> : null}
      {!loading && error ? (
        <StateBlock kind="error" message={error} onRetry={() => void load()} />
      ) : null}
      {!loading && !error && visible.length === 0 ? (
        <StateBlock kind="empty" message={messages.users.empty} />
      ) : null}

      {!loading && !error && visible.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{messages.users.name}</th>
                <th>{messages.users.phone}</th>
                <th>{messages.users.email}</th>
                <th>{messages.users.role}</th>
                <th>{messages.users.status}</th>
                <th>{messages.users.createdAt}</th>
                <th>{messages.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                    <div className="muted tiny">{row.referralCode}</div>
                  </td>
                  <td>{row.phone}</td>
                  <td>{row.email || messages.users.noEmail}</td>
                  <td>
                    <UserRoleBadge role={row.role} />
                  </td>
                  <td>
                    <UserStatusBadge status={row.status} />
                  </td>
                  <td>{formatDateTime(row.createdAt)}</td>
                  <td>
                    <Link className="link-btn" href={`/users/${row.id}`}>
                      {messages.users.open}
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
