'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StateBlock } from '@/components/ui/StateBlock';
import { RefId } from '@/features/finance/RefId';
import { financeApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/errors';
import { formatDateTime, formatMoney } from '@/lib/format';
import { messages } from '@/lib/i18n/en';
import type { AdminWithdrawalDetail } from '@/lib/types/api';

const TRANSFER_REFERENCE = /^[A-Za-z0-9][A-Za-z0-9._:/-]{3,63}$/;

function datetimeLocalToIso(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return new Date(trimmed).toISOString();
}

export function FinanceWithdrawalDetailView({ id }: { id: string }) {
  const [detail, setDetail] = useState<AdminWithdrawalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [transferReference, setTransferReference] = useState('');
  const [actualTransferredAt, setActualTransferredAt] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await financeApi.withdrawal(id);
      setDetail(data);
    } catch (err) {
      setDetail(null);
      setError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onApprove() {
    setSubmitting(true);
    setMutationError(null);
    setSuccess(null);
    try {
      await financeApi.approveWithdrawal(id);
      setApproveOpen(false);
      setSuccess(messages.finance.approveWithdrawalSuccess);
      await load();
    } catch (err) {
      setMutationError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  async function onReject() {
    setSubmitting(true);
    setMutationError(null);
    setSuccess(null);
    try {
      await financeApi.rejectWithdrawal(id, { reason: rejectReason.trim() });
      setRejectOpen(false);
      setRejectReason('');
      setSuccess(messages.finance.rejectWithdrawalSuccess);
      await load();
    } catch (err) {
      setMutationError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  async function onCancel() {
    const reason = cancelReason.trim();
    if (reason.length < 3) {
      return;
    }
    setSubmitting(true);
    setMutationError(null);
    setSuccess(null);
    try {
      await financeApi.cancelWithdrawal(id, { reason });
      setCancelOpen(false);
      setCancelReason('');
      setSuccess(messages.finance.cancelApprovedWithdrawalSuccess);
      await load();
    } catch (err) {
      setMutationError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  async function onMarkPaid() {
    const iso = datetimeLocalToIso(actualTransferredAt);
    if (!iso || !TRANSFER_REFERENCE.test(transferReference.trim())) {
      return;
    }
    setSubmitting(true);
    setMutationError(null);
    setSuccess(null);
    try {
      await financeApi.markWithdrawalPaid(id, {
        transferReference: transferReference.trim(),
        actualTransferredAt: iso,
      });
      setMarkPaidOpen(false);
      setTransferReference('');
      setActualTransferredAt('');
      setSuccess(messages.finance.markPaidSuccess);
      await load();
    } catch (err) {
      setMutationError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <StateBlock kind="loading" />;
  }

  if (error || !detail) {
    return (
      <StateBlock
        kind="error"
        message={error ?? messages.common.notFound}
        onRetry={() => void load()}
      />
    );
  }

  const canReview = detail.status === 'PENDING_REVIEW';
  const canMarkPaid = detail.status === 'APPROVED';
  const canCancel = detail.status === 'APPROVED';
  const cancelValid = cancelReason.trim().length >= 3;
  const markPaidValid =
    TRANSFER_REFERENCE.test(transferReference.trim()) &&
    Boolean(datetimeLocalToIso(actualTransferredAt));

  return (
    <div className="stack">
      <div className="toolbar">
        <Link
          href={
            detail.purpose === 'CUSTOMER_REFERRAL'
              ? '/finance/referral-payouts'
              : '/finance/withdrawals'
          }
          className="link-btn"
        >
          ← {messages.finance.backToWithdrawals}
        </Link>
        <Button variant="secondary" onClick={() => void load()} disabled={submitting}>
          {messages.finance.refresh}
        </Button>
        {canReview ? (
          <>
            <Button onClick={() => setApproveOpen(true)} disabled={submitting}>
              {messages.finance.approveWithdrawal}
            </Button>
            <Button
              variant="danger"
              onClick={() => setRejectOpen(true)}
              disabled={submitting}
            >
              {messages.finance.rejectWithdrawal}
            </Button>
          </>
        ) : null}
        {canMarkPaid ? (
          <Button onClick={() => setMarkPaidOpen(true)} disabled={submitting}>
            {messages.finance.markPaid}
          </Button>
        ) : null}
        {canCancel ? (
          <Button
            variant="danger"
            onClick={() => setCancelOpen(true)}
            disabled={submitting}
          >
            {messages.finance.cancelApprovedWithdrawal}
          </Button>
        ) : null}
      </div>

      <Alert tone="info">{messages.finance.withdrawalsApprovalNotPayment}</Alert>
      <Alert tone="warning">{messages.finance.withdrawalsMaskedAccountNote}</Alert>

      {success ? <Alert tone="success">{success}</Alert> : null}
      {mutationError ? <Alert tone="error">{mutationError}</Alert> : null}

      <section className="panel">
        <h2>{messages.finance.withdrawalDetailTitle}</h2>
        <dl className="detail-grid">
          <div>
            <dt>{messages.finance.amount}</dt>
            <dd>
              {formatMoney(detail.amount)} {detail.currency}
            </dd>
          </div>
          <div>
            <dt>{messages.finance.status}</dt>
            <dd>{detail.status}</dd>
          </div>
          <div>
            <dt>{messages.finance.payoutType}</dt>
            <dd>
              {detail.purpose === 'CUSTOMER_REFERRAL'
                ? messages.finance.payoutPurposeCustomer
                : messages.finance.payoutPurposeAstrologer}
            </dd>
          </div>
          <div>
            <dt>{messages.finance.requestDate}</dt>
            <dd>{formatDateTime(detail.createdAt)}</dd>
          </div>
          <div>
            <dt>
              {detail.purpose === 'CUSTOMER_REFERRAL'
                ? messages.finance.customerName
                : messages.finance.astrologerName}
            </dt>
            <dd>
              {detail.purpose === 'CUSTOMER_REFERRAL'
                ? (detail.customerName ?? detail.beneficiaryName)
                : (detail.astrologerName ?? detail.beneficiaryName)}
              <div className="muted tiny">
                <RefId value={detail.userId} />
              </div>
              <div style={{ marginTop: '0.35rem' }}>
                <Link className="link-btn" href={`/users/${detail.userId}`}>
                  {messages.finance.openUser}
                </Link>
              </div>
            </dd>
          </div>
          <div>
            <dt>ID</dt>
            <dd>
              <RefId value={detail.id} />
            </dd>
          </div>
          {detail.approvedAt ? (
            <div>
              <dt>{messages.finance.approvedAt}</dt>
              <dd>{formatDateTime(detail.approvedAt)}</dd>
            </div>
          ) : null}
          {detail.rejectedAt ? (
            <div>
              <dt>{messages.finance.rejectedAt}</dt>
              <dd>{formatDateTime(detail.rejectedAt)}</dd>
            </div>
          ) : null}
          {detail.rejectionReason ? (
            <div>
              <dt>{messages.finance.rejectionReason}</dt>
              <dd>{detail.rejectionReason}</dd>
            </div>
          ) : null}
          {detail.cancelledAt ? (
            <div>
              <dt>{messages.finance.withdrawalCancelledAt}</dt>
              <dd>{formatDateTime(detail.cancelledAt)}</dd>
            </div>
          ) : null}
          {detail.cancellationReason ? (
            <div>
              <dt>{messages.finance.cancellationReason}</dt>
              <dd>{detail.cancellationReason}</dd>
            </div>
          ) : null}
          {detail.paidAt ? (
            <div>
              <dt>{messages.finance.paidAt}</dt>
              <dd>{formatDateTime(detail.paidAt)}</dd>
            </div>
          ) : null}
          {detail.transferReference ? (
            <div>
              <dt>{messages.finance.transferReference}</dt>
              <dd>{detail.transferReference}</dd>
            </div>
          ) : null}
          {detail.actualTransferredAt ? (
            <div>
              <dt>{messages.finance.actualTransferredAt}</dt>
              <dd>{formatDateTime(detail.actualTransferredAt)}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      {detail.funds ? (
        <section className="panel">
          <h2>{messages.finance.walletBalance}</h2>
          <dl className="detail-grid">
            <div>
              <dt>{messages.finance.walletBalance}</dt>
              <dd>
                {formatMoney(detail.funds.availableBalance)} {detail.currency}
              </dd>
            </div>
            <div>
              <dt>{messages.finance.reservedAmount}</dt>
              <dd>
                {formatMoney(detail.funds.reservedAmount)} {detail.currency}
              </dd>
            </div>
            <div>
              <dt>{messages.finance.shortfallAmount}</dt>
              <dd>
                {formatMoney(detail.funds.shortfallAmount)} {detail.currency}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section className="panel">
        <h2>{messages.finance.bankSnapshot}</h2>
        <dl className="detail-grid">
          <div>
            <dt>{messages.finance.bankName}</dt>
            <dd>{detail.destination.bankName}</dd>
          </div>
          <div>
            <dt>{messages.finance.accountHolder}</dt>
            <dd>{detail.destination.accountHolderName}</dd>
          </div>
          <div>
            <dt>{messages.finance.branchName}</dt>
            <dd>{detail.destination.branchName}</dd>
          </div>
          <div>
            <dt>{messages.finance.bankCode}</dt>
            <dd>{detail.destination.bankCode ?? '—'}</dd>
          </div>
          <div>
            <dt>{messages.finance.branchCode}</dt>
            <dd>{detail.destination.branchCode ?? '—'}</dd>
          </div>
          <div>
            <dt>{messages.finance.accountNumberMasked}</dt>
            <dd>{detail.destination.accountNumberMasked}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2>{messages.finance.withdrawalDebit}</h2>
        {detail.debit ? (
          <dl className="detail-grid">
            <div>
              <dt>ID</dt>
              <dd>
                <RefId value={detail.debit.id} />
              </dd>
            </div>
            <div>
              <dt>{messages.finance.amount}</dt>
              <dd>
                {formatMoney(detail.debit.amount)} {detail.debit.currency}
              </dd>
            </div>
            <div>
              <dt>{messages.finance.createdAt}</dt>
              <dd>{formatDateTime(detail.debit.createdAt)}</dd>
            </div>
          </dl>
        ) : (
          <p className="muted">{messages.finance.noDebitYet}</p>
        )}
      </section>

      <section className="panel">
        <h2>{messages.finance.eventHistory}</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{messages.finance.eventAction}</th>
                <th>{messages.finance.eventActor}</th>
                <th>{messages.finance.eventReason}</th>
                <th>{messages.finance.createdAt}</th>
              </tr>
            </thead>
            <tbody>
              {detail.events.map((event) => (
                <tr key={event.id}>
                  <td>{event.action}</td>
                  <td>{event.actorUserId ?? '—'}</td>
                  <td>{event.reason ?? '—'}</td>
                  <td>{formatDateTime(event.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog
        open={approveOpen}
        title={messages.finance.approveWithdrawalTitle}
        onClose={() => (!submitting ? setApproveOpen(false) : undefined)}
        footer={
          <>
            <Button
              variant="ghost"
              disabled={submitting}
              onClick={() => setApproveOpen(false)}
            >
              {messages.finance.cancelAction}
            </Button>
            <Button loading={submitting} onClick={() => void onApprove()}>
              {messages.finance.confirmApproveWithdrawal}
            </Button>
          </>
        }
      >
        <p>{messages.finance.approveWithdrawalBody}</p>
      </Dialog>

      <Dialog
        open={rejectOpen}
        title={messages.finance.rejectWithdrawalTitle}
        onClose={() => (!submitting ? setRejectOpen(false) : undefined)}
        footer={
          <>
            <Button
              variant="ghost"
              disabled={submitting}
              onClick={() => setRejectOpen(false)}
            >
              {messages.finance.cancelAction}
            </Button>
            <Button
              variant="danger"
              loading={submitting}
              disabled={rejectReason.trim().length < 3}
              onClick={() => void onReject()}
            >
              {messages.finance.confirmRejectWithdrawal}
            </Button>
          </>
        }
      >
        <label className="field">
          <span>{messages.finance.rejectWithdrawalReasonLabel}</span>
          <textarea
            rows={4}
            minLength={3}
            maxLength={500}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={messages.finance.rejectWithdrawalReasonPlaceholder}
            disabled={submitting}
          />
        </label>
      </Dialog>

      <Dialog
        open={markPaidOpen}
        title={messages.finance.markPaidTitle}
        onClose={() => (!submitting ? setMarkPaidOpen(false) : undefined)}
        footer={
          <>
            <Button
              variant="ghost"
              disabled={submitting}
              onClick={() => setMarkPaidOpen(false)}
            >
              {messages.finance.cancelAction}
            </Button>
            <Button
              loading={submitting}
              disabled={!markPaidValid}
              onClick={() => void onMarkPaid()}
            >
              {messages.finance.confirmMarkPaid}
            </Button>
          </>
        }
      >
        <p>{messages.finance.markPaidBody}</p>
        <p className="muted tiny">{messages.finance.withdrawalsMarkPaidIntro}</p>
        <label className="field">
          <span>{messages.finance.transferReference}</span>
          <input
            value={transferReference}
            onChange={(e) => setTransferReference(e.target.value)}
            disabled={submitting}
          />
          <span className="help">{messages.finance.transferReferenceHint}</span>
        </label>
        <label className="field">
          <span>{messages.finance.actualTransferredAtLabel}</span>
          <input
            type="datetime-local"
            value={actualTransferredAt}
            onChange={(e) => setActualTransferredAt(e.target.value)}
            disabled={submitting}
          />
        </label>
      </Dialog>

      <Dialog
        open={cancelOpen}
        title={messages.finance.cancelApprovedWithdrawalTitle}
        onClose={() => (!submitting ? setCancelOpen(false) : undefined)}
        footer={
          <>
            <Button
              variant="ghost"
              disabled={submitting}
              onClick={() => setCancelOpen(false)}
            >
              {messages.finance.cancelAction}
            </Button>
            <Button
              variant="danger"
              loading={submitting}
              disabled={!cancelValid}
              onClick={() => void onCancel()}
            >
              {messages.finance.confirmCancelApprovedWithdrawal}
            </Button>
          </>
        }
      >
        <p>{messages.finance.cancelApprovedWithdrawalBody}</p>
        {detail.funds ? (
          <p>
            {messages.finance.walletBalance}: {formatMoney(detail.funds.availableBalance)}{' '}
            {detail.currency}. {messages.finance.reservedAmount}:{' '}
            {formatMoney(detail.funds.reservedAmount)} {detail.currency}.{' '}
            {messages.finance.shortfallAmount}: {formatMoney(detail.funds.shortfallAmount)}{' '}
            {detail.currency}.
          </p>
        ) : null}
        <label className="field">
          <span>{messages.finance.cancelApprovedWithdrawalReasonLabel}</span>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder={messages.finance.cancelApprovedWithdrawalReasonPlaceholder}
            disabled={submitting}
          />
        </label>
      </Dialog>
    </div>
  );
}
