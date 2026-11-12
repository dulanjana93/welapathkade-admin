'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import {
  UserRoleBadge,
  UserStatusBadge,
} from '@/components/ui/StatusBadge';
import { CorrectReferralDialog } from '@/features/referrals/CorrectReferralDialog';
import { referralsApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/errors';
import { formatDateTime } from '@/lib/format';
import { messages } from '@/lib/i18n/en';
import type {
  AdminReferralCorrection,
  AdminReferralRelationship,
  ReferralAttributionFilter,
  UserRole,
} from '@/lib/types/api';

type RoleFilter = 'ALL' | 'PUBLIC' | 'ASTROLOGER';

const ROLE_FILTERS: RoleFilter[] = ['ALL', 'PUBLIC', 'ASTROLOGER'];
const ATTRIBUTION_FILTERS: ReferralAttributionFilter[] = [
  'ALL',
  'ATTRIBUTED',
  'UNATTRIBUTED',
];

function kindLabel(kind: AdminReferralRelationship['referralKind']) {
  if (kind === 'CUSTOMER') {
    return messages.referrals.kindCustomer;
  }
  if (kind === 'ASTROLOGER') {
    return messages.referrals.kindAstrologer;
  }
  return messages.referrals.kindNone;
}

function attributionLabel(value: ReferralAttributionFilter) {
  if (value === 'ATTRIBUTED') {
    return messages.referrals.attributed;
  }
  if (value === 'UNATTRIBUTED') {
    return messages.referrals.unattributed;
  }
  return messages.referrals.filterAll;
}

function referrerLabel(
  row:
    | AdminReferralRelationship['referredBy']
    | AdminReferralCorrection['previousReferrer']
    | AdminReferralCorrection['newReferrer'],
) {
  if (!row) {
    return messages.referrals.none;
  }
  return `${row.name} (${row.role} · ${row.referralCode})`;
}

export function ReferralsView() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [attributionFilter, setAttributionFilter] =
    useState<ReferralAttributionFilter>('ALL');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<AdminReferralRelationship[]>([]);
  const [corrections, setCorrections] = useState<AdminReferralCorrection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [correcting, setCorrecting] =
    useState<AdminReferralRelationship | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [relationships, correctionRows] = await Promise.all([
        referralsApi.list({
          role:
            roleFilter === 'ALL'
              ? undefined
              : (roleFilter as Extract<UserRole, 'PUBLIC' | 'ASTROLOGER'>),
          attribution: attributionFilter,
        }),
        referralsApi.corrections(100),
      ]);
      setRows(relationships);
      setCorrections(correctionRows);
    } catch (err) {
      setRows([]);
      setCorrections([]);
      setError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, attributionFilter]);

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
        row.user.name,
        row.user.phone,
        row.user.referralCode,
        row.referredBy?.name ?? '',
        row.referredBy?.referralCode ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search]);

  if (loading && rows.length === 0 && !error) {
    return <StateBlock kind="loading" />;
  }

  if (error && rows.length === 0) {
    return (
      <StateBlock
        kind="error"
        message={error}
        onRetry={() => void load()}
      />
    );
  }

  return (
    <div className="stack">
      <p className="muted">{messages.referrals.intro}</p>

      <div className="toolbar">
        <label className="field inline">
          <span>{messages.referrals.roleFilter}</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          >
            {ROLE_FILTERS.map((value) => (
              <option key={value} value={value}>
                {value === 'ALL' ? messages.referrals.filterAll : value}
              </option>
            ))}
          </select>
        </label>
        <label className="field inline">
          <span>{messages.referrals.attributionFilter}</span>
          <select
            value={attributionFilter}
            onChange={(e) =>
              setAttributionFilter(e.target.value as ReferralAttributionFilter)
            }
          >
            {ATTRIBUTION_FILTERS.map((value) => (
              <option key={value} value={value}>
                {attributionLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="field grow">
          <span>{messages.referrals.searchPlaceholder}</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={messages.referrals.searchPlaceholder}
          />
        </label>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          {messages.referrals.refresh}
        </Button>
      </div>

      {success ? <Alert tone="success">{success}</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      <section className="panel">
        {visible.length === 0 ? (
          <p className="muted">{messages.referrals.empty}</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{messages.referrals.referredUser}</th>
                  <th>{messages.referrals.referrer}</th>
                  <th>{messages.referrals.kind}</th>
                  <th>{messages.referrals.createdAt}</th>
                  <th>{messages.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.user.id}>
                    <td>
                      <Link href={`/users/${row.user.id}`}>{row.user.name}</Link>
                      <div className="muted tiny">
                        {row.user.phone} · {row.user.referralCode}
                      </div>
                      <div className="row gap" style={{ marginTop: '0.25rem' }}>
                        <UserRoleBadge role={row.user.role} />
                        <UserStatusBadge status={row.user.status} />
                      </div>
                    </td>
                    <td>
                      {row.referredBy ? (
                        <>
                          <Link href={`/users/${row.referredBy.id}`}>
                            {row.referredBy.name}
                          </Link>
                          <div className="muted tiny">
                            {row.referredBy.referralCode} · {row.referredBy.role}
                          </div>
                        </>
                      ) : (
                        <span className="muted">{messages.referrals.none}</span>
                      )}
                    </td>
                    <td>{kindLabel(row.referralKind)}</td>
                    <td>{formatDateTime(row.user.createdAt)}</td>
                    <td>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSuccess(null);
                          setCorrecting(row);
                        }}
                      >
                        {messages.referrals.correct}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>{messages.referrals.sectionCorrections}</h2>
        {corrections.length === 0 ? (
          <p className="muted">{messages.referrals.correctionsEmpty}</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{messages.referrals.referredUser}</th>
                  <th>{messages.referrals.previousReferrer}</th>
                  <th>{messages.referrals.newReferrer}</th>
                  <th>{messages.referrals.admin}</th>
                  <th>{messages.referrals.reason}</th>
                  <th>{messages.referrals.correctedAt}</th>
                </tr>
              </thead>
              <tbody>
                {corrections.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link href={`/users/${row.targetUser.id}`}>
                        {row.targetUser.name}
                      </Link>
                      <div className="muted tiny">
                        {row.targetUser.referralCode} · {row.targetUser.role}
                      </div>
                    </td>
                    <td>
                      {row.previousReferrer ? (
                        <Link href={`/users/${row.previousReferrer.id}`}>
                          {referrerLabel(row.previousReferrer)}
                        </Link>
                      ) : (
                        referrerLabel(null)
                      )}
                    </td>
                    <td>
                      {row.newReferrer ? (
                        <Link href={`/users/${row.newReferrer.id}`}>
                          {referrerLabel(row.newReferrer)}
                        </Link>
                      ) : (
                        referrerLabel(null)
                      )}
                    </td>
                    <td>{row.adminName}</td>
                    <td>{row.reason}</td>
                    <td>{formatDateTime(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {correcting ? (
        <CorrectReferralDialog
          open
          targetUserId={correcting.user.id}
          targetUserName={correcting.user.name}
          currentReferrer={correcting.referredBy}
          onClose={() => setCorrecting(null)}
          onSuccess={async () => {
            setSuccess(messages.referrals.correctSuccess);
            setCorrecting(null);
            await load();
          }}
        />
      ) : null}
    </div>
  );
}
