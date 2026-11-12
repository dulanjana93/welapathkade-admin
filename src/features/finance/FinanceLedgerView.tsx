'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import {
  dateRangeToQuery,
  FinanceDateRangeFields,
  type DateRangeDraft,
} from '@/features/finance/FinanceDateRangeFields';
import { PaginationBar } from '@/features/finance/PaginationBar';
import { RefId } from '@/features/finance/RefId';
import { financeApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/errors';
import { formatDateTime, formatMoney } from '@/lib/format';
import { messages } from '@/lib/i18n/en';
import type {
  AdminLedgerEntry,
  AdminLedgerList,
  LedgerCategory,
  LedgerEntryKind,
} from '@/lib/types/api';

const CATEGORIES: Array<LedgerCategory | 'ALL'> = [
  'ALL',
  'ASTROLOGER_EARNING',
  'CUSTOMER_REFERRAL',
  'ASTROLOGER_REFERRAL',
  'PLATFORM_RESIDUAL',
];

const KINDS: Array<LedgerEntryKind | 'ALL'> = ['ALL', 'CREDIT', 'DEBIT'];

type LedgerFilters = {
  userId: string;
  appointmentId: string;
  paymentId: string;
  snapshotId: string;
  category: LedgerCategory | 'ALL';
  kind: LedgerEntryKind | 'ALL';
  range: DateRangeDraft;
};

const emptyFilters = (): LedgerFilters => ({
  userId: '',
  appointmentId: '',
  paymentId: '',
  snapshotId: '',
  category: 'ALL',
  kind: 'ALL',
  range: { from: '', to: '' },
});

function filtersToQuery(
  filters: LedgerFilters,
  page: number,
  pageSize: number,
) {
  const range = dateRangeToQuery(filters.range);
  return {
    ...range,
    page,
    pageSize,
    userId: filters.userId.trim() || undefined,
    appointmentId: filters.appointmentId.trim() || undefined,
    paymentId: filters.paymentId.trim() || undefined,
    snapshotId: filters.snapshotId.trim() || undefined,
    category: filters.category === 'ALL' ? undefined : filters.category,
    kind: filters.kind === 'ALL' ? undefined : filters.kind,
  };
}

export function FinanceLedgerView() {
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<LedgerFilters>(emptyFilters);
  const [applied, setApplied] = useState<LedgerFilters>(emptyFilters);
  const [urlReady, setUrlReady] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [result, setResult] = useState<AdminLedgerList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const appointmentId = searchParams.get('appointmentId') ?? '';
    const snapshotId = searchParams.get('snapshotId') ?? '';
    if (!appointmentId && !snapshotId) {
      setUrlReady(true);
      return;
    }
    const fromUrl = {
      ...emptyFilters(),
      appointmentId,
      snapshotId,
    };
    setDraft(fromUrl);
    setApplied(fromUrl);
    setUrlReady(true);
  }, [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await financeApi.ledger(filtersToQuery(applied, page, pageSize));
      setResult(list);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setLoading(false);
    }
  }, [applied, page, pageSize]);

  useEffect(() => {
    if (!urlReady) {
      return;
    }
    void load();
  }, [load, urlReady]);

  const applyFilters = () => {
    setApplied({ ...draft, range: { ...draft.range } });
    setPage(1);
  };

  const clearFilters = () => {
    const next = emptyFilters();
    setDraft(next);
    setApplied(next);
    setPage(1);
  };

  return (
    <div className="stack">
      <p className="muted tiny">{messages.finance.orderingHint}</p>

      <div className="toolbar">
        <label className="field inline">
          <span>{messages.finance.category}</span>
          <select
            value={draft.category}
            onChange={(e) =>
              setDraft({
                ...draft,
                category: e.target.value as LedgerCategory | 'ALL',
              })
            }
          >
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value === 'ALL' ? messages.finance.filterAll : value}
              </option>
            ))}
          </select>
        </label>
        <label className="field inline">
          <span>{messages.finance.kind}</span>
          <select
            value={draft.kind}
            onChange={(e) =>
              setDraft({
                ...draft,
                kind: e.target.value as LedgerEntryKind | 'ALL',
              })
            }
          >
            {KINDS.map((value) => (
              <option key={value} value={value}>
                {value === 'ALL' ? messages.finance.filterAll : value}
              </option>
            ))}
          </select>
        </label>
        <FinanceDateRangeFields
          value={draft.range}
          onChange={(range) => setDraft({ ...draft, range })}
        />
      </div>

      <div className="toolbar">
        <label className="field grow">
          <span>{messages.finance.userId}</span>
          <input
            value={draft.userId}
            onChange={(e) => setDraft({ ...draft, userId: e.target.value })}
          />
        </label>
        <label className="field grow">
          <span>{messages.finance.appointmentId}</span>
          <input
            value={draft.appointmentId}
            onChange={(e) =>
              setDraft({ ...draft, appointmentId: e.target.value })
            }
          />
        </label>
        <label className="field grow">
          <span>{messages.finance.paymentId}</span>
          <input
            value={draft.paymentId}
            onChange={(e) => setDraft({ ...draft, paymentId: e.target.value })}
          />
        </label>
        <label className="field grow">
          <span>{messages.finance.snapshotId}</span>
          <input
            value={draft.snapshotId}
            onChange={(e) => setDraft({ ...draft, snapshotId: e.target.value })}
          />
        </label>
      </div>

      <div className="toolbar">
        <Button variant="secondary" onClick={applyFilters} disabled={loading}>
          {messages.finance.applyFilters}
        </Button>
        <Button variant="secondary" onClick={clearFilters} disabled={loading}>
          {messages.finance.clearFilters}
        </Button>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          {messages.finance.refresh}
        </Button>
      </div>

      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={result?.total ?? 0}
        disabled={loading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      {loading ? <StateBlock kind="loading" /> : null}
      {!loading && error ? (
        <StateBlock kind="error" message={error} onRetry={() => void load()} />
      ) : null}
      {!loading && !error && result && result.items.length === 0 ? (
        <StateBlock kind="empty" message={messages.finance.emptyLedger} />
      ) : null}

      {!loading && !error && result && result.items.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{messages.finance.createdAt}</th>
                <th>{messages.finance.category}</th>
                <th>{messages.finance.kind}</th>
                <th>{messages.finance.amount}</th>
                <th>{messages.finance.currency}</th>
                <th>{messages.finance.appointmentId}</th>
                <th>{messages.finance.paymentId}</th>
                <th>{messages.finance.snapshotId}</th>
                <th>{messages.finance.reversesEntry}</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((row: AdminLedgerEntry) => (
                <tr key={row.id}>
                  <td>{formatDateTime(row.createdAt)}</td>
                  <td>{row.category}</td>
                  <td>{row.kind}</td>
                  <td>{formatMoney(row.amount)}</td>
                  <td>{row.currency}</td>
                  <td>
                    <RefId value={row.appointmentId} />
                  </td>
                  <td>
                    <RefId value={row.paymentId} />
                  </td>
                  <td>
                    <RefId value={row.snapshotId} />
                  </td>
                  <td>
                    {row.reversesEntryId ? (
                      <Link
                        className="link-btn"
                        href={`/finance/ledger?snapshotId=${encodeURIComponent(row.snapshotId)}`}
                        title={row.reversesEntryId}
                      >
                        <RefId value={row.reversesEntryId} />
                      </Link>
                    ) : (
                      messages.finance.noReversal
                    )}
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
