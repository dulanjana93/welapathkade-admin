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
import type { AdminAttentionCasesList } from '@/lib/types/api';

export function FinanceAttentionCasesView() {
  const [draftRange, setDraftRange] = useState<DateRangeDraft>({ from: '', to: '' });
  const [appliedRange, setAppliedRange] = useState<DateRangeDraft>({
    from: '',
    to: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [result, setResult] = useState<AdminAttentionCasesList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await financeApi.attentionCases({
        ...dateRangeToQuery(appliedRange),
        page,
        pageSize,
      });
      setResult(list);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setLoading(false);
    }
  }, [appliedRange, page, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="stack">
      <Alert tone="info">{messages.finance.attentionIntro}</Alert>

      <div className="toolbar">
        <FinanceDateRangeFields value={draftRange} onChange={setDraftRange} />
        <Button
          variant="secondary"
          onClick={() => {
            setAppliedRange({ ...draftRange });
            setPage(1);
          }}
          disabled={loading}
        >
          {messages.finance.applyDates}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setDraftRange({ from: '', to: '' });
            setAppliedRange({ from: '', to: '' });
            setPage(1);
          }}
          disabled={loading}
        >
          {messages.finance.clearDates}
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
        <StateBlock kind="empty" message={messages.finance.emptyAttention} />
      ) : null}

      {!loading && !error && result && result.items.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{messages.finance.appointment}</th>
                <th>{messages.finance.consultation}</th>
                <th>{messages.finance.amount}</th>
                <th>{messages.finance.refundObligation}</th>
                <th>{messages.finance.manualReviewFlag}</th>
                <th>{messages.finance.payment}</th>
                <th>{messages.finance.snapshot}</th>
                <th>{messages.finance.ledgerSummary}</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((row) => (
                <tr key={row.appointmentId}>
                  <td>
                    <Link
                      className="link-btn"
                      href={`/finance/ledger?appointmentId=${encodeURIComponent(row.appointmentId)}`}
                    >
                      <RefId value={row.appointmentId} />
                    </Link>
                    <div className="muted tiny">{row.appointmentStatus}</div>
                    {row.cancelReason ? (
                      <div className="tiny">
                        {messages.finance.cancelReason}: {row.cancelReason}
                      </div>
                    ) : null}
                  </td>
                  <td>
                    <RefId value={row.consultationId} />
                    <div className="muted tiny">{row.consultationStatus}</div>
                    {row.completedAt ? (
                      <div className="tiny">
                        {messages.finance.completedAt}:{' '}
                        {formatDateTime(row.completedAt)}
                      </div>
                    ) : null}
                    {row.noShowRecordedAt ? (
                      <div className="tiny">
                        {messages.finance.noShowAt}:{' '}
                        {formatDateTime(row.noShowRecordedAt)}
                      </div>
                    ) : null}
                  </td>
                  <td>
                    {formatMoney(row.amount)} {row.currency}
                  </td>
                  <td>
                    {row.refundObligation ?? messages.finance.noReversal}
                    {row.refundObligationRecordedAt ? (
                      <div className="tiny muted">
                        {messages.finance.refundRecordedAt}:{' '}
                        {formatDateTime(row.refundObligationRecordedAt)}
                      </div>
                    ) : null}
                    <div className="tiny muted">{messages.finance.externalRefundNo}</div>
                  </td>
                  <td>
                    {row.manualReviewRequired
                      ? messages.common.yes
                      : messages.common.no}
                  </td>
                  <td>
                    {row.payment ? (
                      <>
                        <RefId value={row.payment.id} />
                        <div className="muted tiny">{row.payment.status}</div>
                        <div className="tiny">
                          {formatMoney(row.payment.amount)} {row.payment.currency}
                        </div>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {row.snapshot ? (
                      <>
                        <Link
                          className="link-btn"
                          href={`/finance/ledger?snapshotId=${encodeURIComponent(row.snapshot.id)}`}
                        >
                          <RefId value={row.snapshot.id} />
                        </Link>
                        <div className="muted tiny">{row.snapshot.status}</div>
                        <div className="tiny">
                          {formatMoney(row.snapshot.grossAmount)}{' '}
                          {row.snapshot.currency}
                        </div>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div className="tiny">
                      {messages.finance.hasCredits}:{' '}
                      {row.ledger.hasCredits
                        ? messages.common.yes
                        : messages.common.no}
                    </div>
                    <div className="tiny">
                      {messages.finance.hasReversals}:{' '}
                      {row.ledger.hasReversals
                        ? messages.common.yes
                        : messages.common.no}
                    </div>
                    <div className="muted tiny">
                      {row.ledger.creditCount} CR / {row.ledger.debitCount} DR
                    </div>
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
