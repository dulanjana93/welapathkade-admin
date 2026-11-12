'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
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
  AdminWithdrawalsList,
  WithdrawalPurpose,
  WithdrawalStatus,
} from '@/lib/types/api';

const STATUSES: Array<WithdrawalStatus | 'ALL'> = [
  'ALL',
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
  'PAID',
  'CANCELLED',
];

type WithdrawalFilters = {
  status: WithdrawalStatus | 'ALL';
  userId: string;
  range: DateRangeDraft;
};

const emptyFilters = (): WithdrawalFilters => ({
  status: 'ALL',
  userId: '',
  range: { from: '', to: '' },
});

function filtersToQuery(
  filters: WithdrawalFilters,
  page: number,
  pageSize: number,
  purpose?: WithdrawalPurpose,
) {
  return {
    ...dateRangeToQuery(filters.range),
    page,
    pageSize,
    userId: filters.userId.trim() || undefined,
    status: filters.status === 'ALL' ? undefined : filters.status,
    purpose,
  };
}

function destinationSummary(bankName: string, accountNumberMasked: string) {
  return `${bankName} · ${accountNumberMasked}`;
}

export function FinanceWithdrawalsView({
  purpose,
}: {
  purpose?: WithdrawalPurpose;
}) {
  const [draft, setDraft] = useState<WithdrawalFilters>(emptyFilters);
  const [applied, setApplied] = useState<WithdrawalFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [result, setResult] = useState<AdminWithdrawalsList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await financeApi.withdrawals(
        filtersToQuery(applied, page, pageSize, purpose),
      );
      setResult(list);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setLoading(false);
    }
  }, [applied, page, pageSize, purpose]);

  useEffect(() => {
    void load();
  }, [load]);

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
      <Alert tone="info">
        {purpose === 'CUSTOMER_REFERRAL'
          ? messages.finance.referralPayoutsIntro
          : messages.finance.withdrawalsIntro}
      </Alert>
      <Alert tone="warning">{messages.finance.withdrawalsMaskedAccountNote}</Alert>

      <div className="toolbar">
        <label className="field inline">
          <span>{messages.finance.status}</span>
          <select
            value={draft.status}
            onChange={(e) =>
              setDraft({
                ...draft,
                status: e.target.value as WithdrawalStatus | 'ALL',
              })
            }
          >
            {STATUSES.map((value) => (
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
        <StateBlock kind="empty" message={messages.finance.emptyWithdrawals} />
      ) : null}

      {!loading && !error && result && result.items.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{messages.finance.amount}</th>
                <th>{messages.finance.currency}</th>
                <th>{messages.finance.destination}</th>
                <th>{messages.finance.requestDate}</th>
                <th>{messages.finance.status}</th>
                <th>
                  {purpose === 'CUSTOMER_REFERRAL'
                    ? messages.finance.customerName
                    : messages.finance.astrologerName}
                </th>
                <th>{messages.finance.viewWithdrawal}</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((row) => (
                <tr key={row.id}>
                  <td>{formatMoney(row.amount)}</td>
                  <td>{row.currency}</td>
                  <td>
                    {destinationSummary(
                      row.destination.bankName,
                      row.destination.accountNumberMasked,
                    )}
                  </td>
                  <td>{formatDateTime(row.createdAt)}</td>
                  <td>{row.status}</td>
                  <td>
                    {purpose === 'CUSTOMER_REFERRAL'
                      ? (row.customerName ?? row.beneficiaryName)
                      : (row.astrologerName ?? row.beneficiaryName)}
                    <div className="muted tiny">
                      <RefId value={row.userId} />
                    </div>
                  </td>
                  <td>
                    <Link
                      className="link-btn"
                      href={`/finance/withdrawals/${encodeURIComponent(row.id)}`}
                    >
                      {messages.finance.viewWithdrawal}
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
