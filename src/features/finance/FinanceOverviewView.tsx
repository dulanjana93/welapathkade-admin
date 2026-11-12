'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import {
  dateRangeToQuery,
  FinanceDateRangeFields,
  type DateRangeDraft,
} from '@/features/finance/FinanceDateRangeFields';
import { financeApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/errors';
import { formatDateTime, formatMoney } from '@/lib/format';
import { messages } from '@/lib/i18n/en';
import type {
  AdminFinanceOverview,
  AdminFinanceWithdrawalsOverview,
  FinancialSnapshotStatus,
  LedgerCategory,
} from '@/lib/types/api';

const SNAPSHOT_STATUSES: FinancialSnapshotStatus[] = [
  'RECORDED',
  'POSTED',
  'REVERSED',
];

const LEDGER_CATEGORIES: LedgerCategory[] = [
  'ASTROLOGER_EARNING',
  'CUSTOMER_REFERRAL',
  'ASTROLOGER_REFERRAL',
  'PLATFORM_RESIDUAL',
];

export function FinanceOverviewView() {
  const [draftRange, setDraftRange] = useState<DateRangeDraft>({ from: '', to: '' });
  const [appliedRange, setAppliedRange] = useState<DateRangeDraft>({
    from: '',
    to: '',
  });
  const [data, setData] = useState<AdminFinanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (range: DateRangeDraft) => {
    setLoading(true);
    setError(null);
    try {
      const overview = await financeApi.overview(dateRangeToQuery(range));
      setData(overview);
    } catch (err) {
      setData(null);
      setError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(appliedRange);
  }, [appliedRange, load]);

  const applyRange = () => {
    setAppliedRange({ ...draftRange });
  };

  const clearRange = () => {
    setDraftRange({ from: '', to: '' });
    setAppliedRange({ from: '', to: '' });
  };

  return (
    <div className="stack">
      <Alert tone="warning">{messages.finance.disclaimer}</Alert>

      <div className="toolbar">
        <FinanceDateRangeFields value={draftRange} onChange={setDraftRange} />
        <span className="help">{messages.finance.dateHint}</span>
        <Button variant="secondary" onClick={applyRange} disabled={loading}>
          {messages.finance.applyDates}
        </Button>
        <Button variant="secondary" onClick={clearRange} disabled={loading}>
          {messages.finance.clearDates}
        </Button>
        <Button
          variant="secondary"
          onClick={() => void load(appliedRange)}
          disabled={loading}
        >
          {messages.finance.refresh}
        </Button>
      </div>

      {loading ? <StateBlock kind="loading" /> : null}
      {!loading && error ? (
        <StateBlock
          kind="error"
          message={error}
          onRetry={() => void load(appliedRange)}
        />
      ) : null}

      {!loading && !error && data ? (
        <>
          <p className="muted tiny">
            {messages.finance.intervalLabel}:{' '}
            {data.dateRange.from
              ? formatDateTime(data.dateRange.from)
              : messages.finance.filterAll}{' '}
            →{' '}
            {data.dateRange.to
              ? formatDateTime(data.dateRange.to)
              : messages.finance.filterAll}{' '}
            ({data.dateRange.interval})
          </p>

          <section className="panel">
            <h2>{messages.finance.snapshotsByStatus}</h2>
            <div className="stat-grid">
              {SNAPSHOT_STATUSES.map((status) => (
                <div key={status} className="stat-card">
                  <p className="muted">{status}</p>
                  <strong className="stat-value">
                    {data.snapshotsByStatus[status].count}
                  </strong>
                  <p className="tiny">
                    {formatMoney(data.snapshotsByStatus[status].grossAmount)}
                  </p>
                </div>
              ))}
            </div>
            <p className="muted tiny" style={{ marginTop: '0.75rem' }}>
              {messages.finance.postedGross}:{' '}
              <strong>{formatMoney(data.postedGrossAmount)}</strong>
            </p>
          </section>

          <section className="panel">
            <h2>{messages.finance.ledgerByCategory}</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{messages.finance.category}</th>
                    <th>{messages.finance.credits}</th>
                    <th>{messages.finance.debits}</th>
                    <th>{messages.finance.net}</th>
                    <th>{messages.finance.creditCount}</th>
                    <th>{messages.finance.debitCount}</th>
                  </tr>
                </thead>
                <tbody>
                  {LEDGER_CATEGORIES.map((category) => {
                    const row = data.ledgerByCategory[category];
                    return (
                      <tr key={category}>
                        <td>{category}</td>
                        <td>{formatMoney(row.creditAmount)}</td>
                        <td>{formatMoney(row.debitAmount)}</td>
                        <td>{formatMoney(row.netAmount)}</td>
                        <td>{row.creditCount}</td>
                        <td>{row.debitCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <div className="stat-grid">
            <div className="stat-card">
              <p className="muted">{messages.finance.refundObligations}</p>
              <strong className="stat-value">{data.refundObligations.count}</strong>
              <p>{formatMoney(data.refundObligations.grossAmount)}</p>
              <p className="tiny muted">{data.refundObligations.note}</p>
            </div>
            <div className="stat-card">
              <p className="muted">{messages.finance.manualReview}</p>
              <strong className="stat-value">{data.manualReview.count}</strong>
            </div>
          </div>

          {data.withdrawals ? (
            <PayoutScopeCard
              title={messages.finance.overviewAstrologerWithdrawals}
              data={data.withdrawals}
            />
          ) : null}
          {data.customerReferralPayouts ? (
            <PayoutScopeCard
              title={messages.finance.overviewCustomerPayouts}
              data={data.customerReferralPayouts}
            />
          ) : null}
          {data.payoutsCombined ? (
            <PayoutScopeCard
              title={messages.finance.overviewCombinedPayouts}
              data={data.payoutsCombined}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function PayoutScopeCard({
  title,
  data,
}: {
  title: string;
  data: AdminFinanceWithdrawalsOverview;
}) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <p className="muted tiny">{data.note}</p>
      <div className="stat-grid">
        <div className="stat-card">
          <p className="muted">{messages.finance.overviewReserved}</p>
          <strong className="stat-value">{formatMoney(data.reservedAmount)}</strong>
        </div>
        <div className="stat-card">
          <p className="muted">{messages.finance.overviewPaidRecorded}</p>
          <strong className="stat-value">{formatMoney(data.paidAmount)}</strong>
        </div>
        <div className="stat-card">
          <p className="muted">{messages.finance.overviewDebits}</p>
          <strong className="stat-value">{data.debitCount}</strong>
          <p>{formatMoney(data.debitAmount)}</p>
        </div>
      </div>
    </section>
  );
}
