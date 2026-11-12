'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { RefId } from '@/features/finance/RefId';
import { financeApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/errors';
import { messages } from '@/lib/i18n/en';
import type { AdminFinanceReconcile } from '@/lib/types/api';

export function FinanceReconcileView() {
  const [result, setResult] = useState<AdminFinanceReconcile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await financeApi.reconcile();
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="stack">
      <Alert tone="info">{messages.finance.reconcileIntro}</Alert>

      <div className="toolbar">
        <Button onClick={() => void run()} disabled={loading}>
          {loading ? messages.finance.runningReconcile : messages.finance.runReconcile}
        </Button>
      </div>

      {loading ? <StateBlock kind="loading" /> : null}
      {!loading && error ? (
        <StateBlock kind="error" message={error} onRetry={() => void run()} />
      ) : null}

      {!loading && !error && !result ? (
        <StateBlock kind="empty" message={messages.finance.reconcileNotRun} />
      ) : null}

      {!loading && !error && result ? (
        <>
          <Alert tone={result.complete ? 'success' : 'warning'}>
            {result.complete
              ? messages.finance.reconcileComplete
              : messages.finance.reconcileIncomplete}
          </Alert>

          <div className="stat-grid">
            <div className="stat-card">
              <p className="muted">{messages.finance.scannedWallets}</p>
              <strong className="stat-value">
                {result.scanned.wallets} / {result.scanned.walletTotal}
              </strong>
            </div>
            <div className="stat-card">
              <p className="muted">{messages.finance.scannedSnapshots}</p>
              <strong className="stat-value">
                {result.scanned.snapshots} / {result.scanned.snapshotTotal}
              </strong>
            </div>
            <div className="stat-card">
              <p className="muted">{messages.finance.recentLedgerSample}</p>
              <strong className="stat-value">
                {result.scanned.recentLedgerEntries}
              </strong>
            </div>
            <div className="stat-card">
              <p className="muted">{messages.finance.issueCount}</p>
              <strong className="stat-value">{result.issueCount}</strong>
            </div>
          </div>

          <p className="muted tiny">
            {messages.finance.signConventionNote}: {result.notes.signConvention}
          </p>

          {result.issueCount === 0 ? (
            <StateBlock kind="empty" message={messages.finance.noIssues} />
          ) : null}

          {result.issuesTruncated ? (
            <Alert tone="warning">{messages.finance.issuesTruncated}</Alert>
          ) : null}

          {result.issues.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{messages.finance.issueCode}</th>
                    <th>{messages.finance.issueMessage}</th>
                    <th>{messages.finance.issueReferences}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.issues.map((issue, index) => (
                    <tr key={`${issue.code}-${index}`}>
                      <td>{issue.code}</td>
                      <td>{issue.message}</td>
                      <td>
                        <ul className="ref-list">
                          {Object.entries(issue.references).map(([key, value]) => (
                            <li key={key}>
                              <span className="muted">{key}: </span>
                              <RefId value={value} />
                              {key === 'withdrawalId' && value ? (
                                <>
                                  {' '}
                                  <Link
                                    className="link-btn"
                                    href={`/finance/withdrawals/${encodeURIComponent(value)}`}
                                  >
                                    {messages.finance.viewWithdrawal}
                                  </Link>
                                </>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
