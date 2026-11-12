'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import {
  AppointmentStatusBadge,
  ConsultationStatusBadge,
  FinancialSnapshotStatusBadge,
  LedgerEntryKindBadge,
  PayHereRefundStatusBadge,
  PaymentStatusBadge,
  ProfileStatusBadge,
  ProposalStatusBadge,
  RefundObligationBadge,
  ServiceStatusBadge,
  UserRoleBadge,
  UserStatusBadge,
} from '@/components/ui/StatusBadge';
import { RefId } from '@/features/finance/RefId';
import { consultationsApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/errors';
import { formatDateTime, formatMoney } from '@/lib/format';
import { messages } from '@/lib/i18n/en';
import type {
  AdminConsultationAppointmentDetail,
  AdminConsultationDetail,
  AdminConsultationProposal,
} from '@/lib/types/api';

function dash(value: string | null | undefined) {
  return value && value.trim() ? value : messages.consultations.none;
}

function ProposalBlock({
  title,
  proposal,
}: {
  title: string;
  proposal: AdminConsultationProposal | null;
}) {
  if (!proposal) {
    return (
      <div>
        <h3>{title}</h3>
        <p className="muted">{messages.consultations.none}</p>
      </div>
    );
  }

  return (
    <div>
      <h3>{title}</h3>
      <dl className="detail-grid">
        <div>
          <dt>{messages.consultations.proposalId}</dt>
          <dd>
            <RefId value={proposal.id} />
          </dd>
        </div>
        <div>
          <dt>{messages.consultations.status}</dt>
          <dd>
            <ProposalStatusBadge status={proposal.status} />
          </dd>
        </div>
        <div>
          <dt>{messages.consultations.proposedStart}</dt>
          <dd>{formatDateTime(proposal.proposedStartAt)}</dd>
        </div>
        <div>
          <dt>{messages.consultations.proposedEnd}</dt>
          <dd>{formatDateTime(proposal.proposedEndAt)}</dd>
        </div>
        <div>
          <dt>{messages.consultations.localDate}</dt>
          <dd>{dash(proposal.localDate)}</dd>
        </div>
        <div>
          <dt>{messages.consultations.localStartTime}</dt>
          <dd>{dash(proposal.localStartTime)}</dd>
        </div>
        <div>
          <dt>{messages.consultations.localEndTime}</dt>
          <dd>{dash(proposal.localEndTime)}</dd>
        </div>
        <div>
          <dt>{messages.consultations.timezone}</dt>
          <dd>{dash(proposal.timezone)}</dd>
        </div>
        <div>
          <dt>{messages.consultations.durationMinutes}</dt>
          <dd>{proposal.durationMinutes}</dd>
        </div>
        <div>
          <dt>{messages.consultations.createdAt}</dt>
          <dd>{formatDateTime(proposal.createdAt)}</dd>
        </div>
      </dl>
    </div>
  );
}

function AppointmentSection({
  appointment,
}: {
  appointment: AdminConsultationAppointmentDetail;
}) {
  const credits = appointment.ledger.entries.filter((e) => e.kind === 'CREDIT');
  const debits = appointment.ledger.entries.filter((e) => e.kind === 'DEBIT');
  const hasObligation =
    appointment.refundObligation === 'FULL_REFUND_DUE';
  const noGatewayRefunds = appointment.refunds.length === 0;

  return (
    <article className="panel">
      <h3>
        {messages.consultations.appointmentId}{' '}
        <RefId value={appointment.id} />
      </h3>
      <dl className="detail-grid">
        <div>
          <dt>{messages.consultations.status}</dt>
          <dd>
            <AppointmentStatusBadge status={appointment.status} />
          </dd>
        </div>
        <div>
          <dt>{messages.consultations.schedule}</dt>
          <dd>
            {formatDateTime(appointment.startAt)} →{' '}
            {formatDateTime(appointment.endAt)} ({appointment.durationMinutes}{' '}
            min)
          </dd>
        </div>
        <div>
          <dt>{messages.consultations.appointmentAmount}</dt>
          <dd>
            {formatMoney(appointment.amount)} {appointment.currency}
          </dd>
        </div>
        <div>
          <dt>{messages.consultations.reservationExpires}</dt>
          <dd>{formatDateTime(appointment.reservationExpiresAt)}</dd>
        </div>
        <div>
          <dt>{messages.consultations.confirmedAt}</dt>
          <dd>{dash(appointment.confirmedAt ? formatDateTime(appointment.confirmedAt) : null)}</dd>
        </div>
        <div>
          <dt>{messages.consultations.sessionStarted}</dt>
          <dd>
            {dash(
              appointment.sessionStartedAt
                ? formatDateTime(appointment.sessionStartedAt)
                : null,
            )}
          </dd>
        </div>
        <div>
          <dt>{messages.consultations.sessionEnded}</dt>
          <dd>
            {dash(
              appointment.sessionEndedAt
                ? formatDateTime(appointment.sessionEndedAt)
                : null,
            )}
          </dd>
        </div>
        <div>
          <dt>{messages.consultations.actualDuration}</dt>
          <dd>
            {appointment.actualDurationSeconds != null
              ? appointment.actualDurationSeconds
              : messages.consultations.none}
          </dd>
        </div>
        <div>
          <dt>{messages.consultations.cancelReason}</dt>
          <dd>{dash(appointment.cancelReason)}</dd>
        </div>
        <div>
          <dt>{messages.consultations.cancelledAt}</dt>
          <dd>
            {dash(
              appointment.cancelledAt
                ? formatDateTime(appointment.cancelledAt)
                : null,
            )}
          </dd>
        </div>
        <div>
          <dt>{messages.consultations.noShowAt}</dt>
          <dd>
            {dash(
              appointment.noShowRecordedAt
                ? formatDateTime(appointment.noShowRecordedAt)
                : null,
            )}
          </dd>
        </div>
        <div>
          <dt>{messages.consultations.refundObligation}</dt>
          <dd>
            {appointment.refundObligation ? (
              <RefundObligationBadge status={appointment.refundObligation} />
            ) : (
              messages.consultations.none
            )}
            {appointment.refundObligationRecordedAt ? (
              <div className="muted tiny">
                {formatDateTime(appointment.refundObligationRecordedAt)}
              </div>
            ) : null}
          </dd>
        </div>
        <div>
          <dt>{messages.consultations.manualReview}</dt>
          <dd>
            {appointment.manualReviewRequired
              ? messages.consultations.filterYes
              : messages.consultations.filterNo}
          </dd>
        </div>
      </dl>

      <h4>{messages.consultations.payment}</h4>
      {appointment.payment ? (
        <>
          <dl className="detail-grid">
            <div>
              <dt>{messages.consultations.status}</dt>
              <dd>
                <PaymentStatusBadge status={appointment.payment.status} />
              </dd>
            </div>
            <div>
              <dt>{messages.consultations.paymentAmount}</dt>
              <dd>
                {formatMoney(appointment.payment.amount)}{' '}
                {appointment.payment.currency}
              </dd>
            </div>
            <div>
              <dt>{messages.consultations.provider}</dt>
              <dd>{appointment.payment.provider}</dd>
            </div>
            <div>
              <dt>{messages.consultations.paidAt}</dt>
              <dd>
                {dash(
                  appointment.payment.paidAt
                    ? formatDateTime(appointment.payment.paidAt)
                    : null,
                )}
              </dd>
            </div>
          </dl>
          <h5>{messages.consultations.attempts}</h5>
          {appointment.payment.attempts.length === 0 ? (
            <p className="muted">{messages.consultations.noAttempts}</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{messages.consultations.status}</th>
                    <th>{messages.consultations.merchantReference}</th>
                    <th>{messages.consultations.providerPaymentId}</th>
                    <th>{messages.consultations.requiresReview}</th>
                    <th>{messages.consultations.createdAt}</th>
                  </tr>
                </thead>
                <tbody>
                  {appointment.payment.attempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td>
                        <PaymentStatusBadge status={attempt.status} />
                      </td>
                      <td>
                        <RefId value={attempt.merchantReference} />
                      </td>
                      <td>{dash(attempt.providerPaymentId)}</td>
                      <td>
                        {attempt.requiresReview
                          ? messages.consultations.filterYes
                          : messages.consultations.filterNo}
                      </td>
                      <td>{formatDateTime(attempt.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <p className="muted">{messages.consultations.noPayment}</p>
      )}

      <h4>{messages.consultations.refunds}</h4>
      {hasObligation && noGatewayRefunds ? (
        <Alert tone="warning">{messages.consultations.obligationOnly}</Alert>
      ) : null}
      {appointment.refunds.length === 0 ? (
        <p className="muted">{messages.consultations.noRefunds}</p>
      ) : (
        <div className="stack">
          {appointment.refunds.map((refund) => (
            <dl key={refund.id} className="detail-grid">
              <div>
                <dt>{messages.consultations.refundId}</dt>
                <dd>
                  <RefId value={refund.id} />
                  <div className="muted tiny">{refund.payherePaymentId}</div>
                </dd>
              </div>
              <div>
                <dt>{messages.consultations.status}</dt>
                <dd>
                  <PayHereRefundStatusBadge status={refund.status} />
                </dd>
              </div>
              <div>
                <dt>{messages.consultations.refundReason}</dt>
                <dd>{refund.reason}</dd>
              </div>
              <div>
                <dt>{messages.consultations.refundAmount}</dt>
                <dd>
                  {formatMoney(refund.amount)} {refund.currency}
                </dd>
              </div>
              <div>
                <dt>{messages.consultations.payhereRefundNumber}</dt>
                <dd>{dash(refund.payhereRefundNumber)}</dd>
              </div>
              <div>
                <dt>{messages.consultations.providerStatus}</dt>
                <dd>
                  {refund.providerStatus != null
                    ? String(refund.providerStatus)
                    : messages.consultations.none}
                </dd>
              </div>
              <div>
                <dt>{messages.consultations.initiatedAt}</dt>
                <dd>{formatDateTime(refund.initiatedAt)}</dd>
              </div>
              <div>
                <dt>{messages.consultations.completedAt}</dt>
                <dd>
                  {dash(
                    refund.completedAt
                      ? formatDateTime(refund.completedAt)
                      : null,
                  )}
                </dd>
              </div>
              <div>
                <dt>{messages.consultations.lastReconciledAt}</dt>
                <dd>
                  {dash(
                    refund.lastReconciledAt
                      ? formatDateTime(refund.lastReconciledAt)
                      : null,
                  )}
                </dd>
              </div>
              <div>
                <dt>{messages.consultations.failureMessage}</dt>
                <dd>{dash(refund.failureMessage)}</dd>
              </div>
            </dl>
          ))}
        </div>
      )}

      <h4>{messages.consultations.snapshot}</h4>
      {appointment.snapshot ? (
        <dl className="detail-grid">
          <div>
            <dt>{messages.consultations.snapshotStatus}</dt>
            <dd>
              <FinancialSnapshotStatusBadge
                status={appointment.snapshot.status}
              />
            </dd>
          </div>
          <div>
            <dt>{messages.consultations.grossAmount}</dt>
            <dd>
              {formatMoney(appointment.snapshot.grossAmount)}{' '}
              {appointment.snapshot.currency}
            </dd>
          </div>
          <div>
            <dt>{messages.consultations.basis}</dt>
            <dd>{appointment.snapshot.basis}</dd>
          </div>
          <div>
            <dt>{messages.consultations.holdExpiresAt}</dt>
            <dd>{formatDateTime(appointment.snapshot.holdExpiresAt)}</dd>
          </div>
          <div>
            <dt>{messages.consultations.postedAt}</dt>
            <dd>
              {dash(
                appointment.snapshot.postedAt
                  ? formatDateTime(appointment.snapshot.postedAt)
                  : null,
              )}
            </dd>
          </div>
          <div>
            <dt>{messages.consultations.reversedAt}</dt>
            <dd>
              {dash(
                appointment.snapshot.reversedAt
                  ? formatDateTime(appointment.snapshot.reversedAt)
                  : null,
              )}
            </dd>
          </div>
          <div>
            <dt>{messages.consultations.astrologerShare}</dt>
            <dd>
              {formatMoney(appointment.snapshot.astrologerAmount)}{' '}
              {appointment.snapshot.currency} (
              {appointment.snapshot.astrologerPercent}
              {messages.consultations.percentLabel})
            </dd>
          </div>
          <div>
            <dt>{messages.consultations.customerReferral}</dt>
            <dd>
              {formatMoney(appointment.snapshot.customerReferralAmount)}{' '}
              {appointment.snapshot.currency} (
              {appointment.snapshot.customerReferralPercent}
              {messages.consultations.percentLabel})
            </dd>
          </div>
          <div>
            <dt>{messages.consultations.astrologerReferral}</dt>
            <dd>
              {formatMoney(appointment.snapshot.astrologerReferralAmount)}{' '}
              {appointment.snapshot.currency} (
              {appointment.snapshot.astrologerReferralPercent}
              {messages.consultations.percentLabel})
            </dd>
          </div>
          <div>
            <dt>{messages.consultations.platformResidual}</dt>
            <dd>
              {formatMoney(appointment.snapshot.platformAmount)}{' '}
              {appointment.snapshot.currency} (
              {appointment.snapshot.platformPercent}
              {messages.consultations.percentLabel})
            </dd>
          </div>
        </dl>
      ) : (
        <p className="muted">{messages.consultations.noSnapshot}</p>
      )}

      <h4>{messages.consultations.ledger}</h4>
      <p className="muted tiny">
        {messages.consultations.ledgerCreditsLabel}:{' '}
        {appointment.ledger.creditCount} ·{' '}
        {messages.consultations.ledgerDebitsLabel}:{' '}
        {appointment.ledger.debitCount} ·{' '}
        {messages.consultations.ledgerCreditCount}:{' '}
        {appointment.ledger.creditCount} ·{' '}
        {messages.consultations.ledgerDebitCount}:{' '}
        {appointment.ledger.debitCount} ·{' '}
        {messages.consultations.ledgerHasCredits}:{' '}
        {appointment.ledger.hasCredits
          ? messages.consultations.filterYes
          : messages.consultations.filterNo}{' '}
        · {messages.consultations.ledgerHasReversals}:{' '}
        {appointment.ledger.hasReversals
          ? messages.consultations.filterYes
          : messages.consultations.filterNo}
      </p>
      {appointment.ledger.entries.length === 0 ? (
        <p className="muted">{messages.consultations.noLedger}</p>
      ) : (
        <>
          <h5>{messages.consultations.ledgerCredits}</h5>
          {credits.length === 0 ? (
            <p className="muted">{messages.consultations.none}</p>
          ) : (
            <LedgerTable entries={credits} />
          )}
          <h5>{messages.consultations.ledgerDebits}</h5>
          {debits.length === 0 ? (
            <p className="muted">{messages.consultations.none}</p>
          ) : (
            <LedgerTable entries={debits} />
          )}
        </>
      )}
    </article>
  );
}

function LedgerTable({
  entries,
}: {
  entries: AdminConsultationAppointmentDetail['ledger']['entries'];
}) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>{messages.consultations.entryKind}</th>
            <th>{messages.consultations.category}</th>
            <th>{messages.consultations.ledgerAmount}</th>
            <th>{messages.consultations.reversesEntry}</th>
            <th>{messages.consultations.createdAt}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>
                <LedgerEntryKindBadge kind={entry.kind} />
              </td>
              <td>{entry.category}</td>
              <td>
                {formatMoney(entry.amount)} {entry.currency}
              </td>
              <td>
                {entry.reversesEntryId ? (
                  <RefId value={entry.reversesEntryId} />
                ) : (
                  messages.consultations.none
                )}
              </td>
              <td>{formatDateTime(entry.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ConsultationDetailView({ id }: { id: string }) {
  const [detail, setDetail] = useState<AdminConsultationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await consultationsApi.get(id);
      setDetail(data);
    } catch (err) {
      setDetail(null);
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
        setError(messages.consultations.notFound);
      } else {
        setError(err instanceof ApiError ? err.message : messages.common.error);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <StateBlock kind="loading" />;
  }

  if (notFound) {
    return (
      <div className="stack">
        <Link href="/consultations" className="link-btn">
          ← {messages.consultations.back}
        </Link>
        <StateBlock kind="empty" message={messages.consultations.notFound} />
      </div>
    );
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

  const { consultation } = detail;

  return (
    <div className="stack">
      <div className="toolbar">
        <Link href="/consultations" className="link-btn">
          ← {messages.consultations.back}
        </Link>
        <Button variant="secondary" onClick={() => void load()}>
          {messages.consultations.refresh}
        </Button>
      </div>

      <Alert tone="info">{messages.consultations.readOnlyNote}</Alert>
      <Alert tone="warning">{messages.consultations.paymentNotSettlement}</Alert>
      <Alert tone="warning">
        {messages.consultations.obligationNotGatewayRefund}
      </Alert>

      <section className="panel">
        <h2>{messages.consultations.sectionOverview}</h2>
        <dl className="detail-grid">
          <div>
            <dt>{messages.consultations.consultationId}</dt>
            <dd>
              <RefId value={consultation.id} />
            </dd>
          </div>
          <div>
            <dt>{messages.consultations.status}</dt>
            <dd>
              <ConsultationStatusBadge status={consultation.status} />
            </dd>
          </div>
          <div>
            <dt>{messages.consultations.submitted}</dt>
            <dd>{formatDateTime(consultation.submittedAt)}</dd>
          </div>
          <div>
            <dt>{messages.consultations.viewedAt}</dt>
            <dd>
              {dash(
                consultation.viewedAt
                  ? formatDateTime(consultation.viewedAt)
                  : null,
              )}
            </dd>
          </div>
          <div>
            <dt>{messages.consultations.respondedAt}</dt>
            <dd>
              {dash(
                consultation.respondedAt
                  ? formatDateTime(consultation.respondedAt)
                  : null,
              )}
            </dd>
          </div>
          <div>
            <dt>{messages.consultations.expiresAt}</dt>
            <dd>{formatDateTime(consultation.expiresAt)}</dd>
          </div>
          <div>
            <dt>{messages.consultations.completedAt}</dt>
            <dd>
              {dash(
                consultation.completedAt
                  ? formatDateTime(consultation.completedAt)
                  : null,
              )}
            </dd>
          </div>
          <div>
            <dt>{messages.consultations.declineReason}</dt>
            <dd>{dash(consultation.declineReason)}</dd>
          </div>
          <div className="span-2">
            <dt>{messages.consultations.message}</dt>
            <dd>{dash(consultation.message)}</dd>
          </div>
          <div className="span-2">
            <dt>{messages.consultations.astrologerSummary}</dt>
            <dd>{dash(consultation.astrologerSummary)}</dd>
          </div>
          <div>
            <dt>{messages.consultations.preferredStart}</dt>
            <dd>{formatDateTime(consultation.preferredStartAt)}</dd>
          </div>
          <div>
            <dt>{messages.consultations.preferredEnd}</dt>
            <dd>
              {dash(
                consultation.preferredEndAt
                  ? formatDateTime(consultation.preferredEndAt)
                  : null,
              )}
            </dd>
          </div>
          <div>
            <dt>{messages.consultations.createdAt}</dt>
            <dd>{formatDateTime(consultation.createdAt)}</dd>
          </div>
          <div>
            <dt>{messages.consultations.updatedAt}</dt>
            <dd>{formatDateTime(consultation.updatedAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2>{messages.consultations.sectionPeople}</h2>
        <div className="stack">
          <div>
            <h3>{messages.consultations.customer}</h3>
            <dl className="detail-grid">
              <div>
                <dt>{messages.consultations.customer}</dt>
                <dd>
                  {detail.customer.name}{' '}
                  <Link href={`/users/${detail.customer.id}`} className="link-btn">
                    {messages.consultations.openUser}
                  </Link>
                </dd>
              </div>
              <div>
                <dt>{messages.consultations.phone}</dt>
                <dd>{detail.customer.phone}</dd>
              </div>
              <div>
                <dt>{messages.consultations.email}</dt>
                <dd>
                  {detail.customer.email ?? messages.consultations.noEmail}
                </dd>
              </div>
              <div>
                <dt>{messages.consultations.role}</dt>
                <dd>
                  <UserRoleBadge role={detail.customer.role} />
                </dd>
              </div>
              <div>
                <dt>{messages.consultations.accountStatus}</dt>
                <dd>
                  <UserStatusBadge status={detail.customer.status} />
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <h3>{messages.consultations.astrologer}</h3>
            <dl className="detail-grid">
              <div>
                <dt>{messages.consultations.astrologer}</dt>
                <dd>
                  {detail.astrologer.displayName}{' '}
                  <Link
                    href={`/astrologers/${detail.astrologer.id}`}
                    className="link-btn"
                  >
                    {messages.consultations.openAstrologer}
                  </Link>
                </dd>
              </div>
              <div>
                <dt>{messages.consultations.profileStatus}</dt>
                <dd>
                  <ProfileStatusBadge status={detail.astrologer.status} />
                </dd>
              </div>
              <div>
                <dt>{messages.consultations.city}</dt>
                <dd>{dash(detail.astrologer.city)}</dd>
              </div>
              <div>
                <dt>{messages.consultations.district}</dt>
                <dd>{dash(detail.astrologer.district)}</dd>
              </div>
              <div>
                <dt>{messages.consultations.phone}</dt>
                <dd>{detail.astrologer.user.phone}</dd>
              </div>
              <div>
                <dt>{messages.consultations.accountStatus}</dt>
                <dd>
                  <UserStatusBadge status={detail.astrologer.user.status} />
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>{messages.consultations.sectionService}</h2>
        <dl className="detail-grid">
          <div>
            <dt>{messages.consultations.service}</dt>
            <dd>
              {detail.service.nameEn}
              <div className="muted tiny">{detail.service.nameSi}</div>
            </dd>
          </div>
          <div>
            <dt>{messages.consultations.serviceCode}</dt>
            <dd>{detail.service.code}</dd>
          </div>
          <div>
            <dt>{messages.consultations.status}</dt>
            <dd>
              <ServiceStatusBadge status={detail.service.status} />
            </dd>
          </div>
          <div>
            <dt>{messages.consultations.requestedPrice}</dt>
            <dd>
              {formatMoney(consultation.requestedPrice)} {consultation.currency}
            </dd>
          </div>
          <div>
            <dt>{messages.consultations.currency}</dt>
            <dd>{consultation.currency}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2>{messages.consultations.sectionProposals}</h2>
        <ProposalBlock
          title={messages.consultations.pendingProposal}
          proposal={detail.pendingProposal}
        />
        <ProposalBlock
          title={messages.consultations.acceptedProposal}
          proposal={detail.acceptedProposal}
        />
        {detail.proposals.length === 0 ? (
          <p className="muted">{messages.consultations.noProposals}</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{messages.consultations.proposalId}</th>
                  <th>{messages.consultations.status}</th>
                  <th>{messages.consultations.proposedStart}</th>
                  <th>{messages.consultations.proposedEnd}</th>
                  <th>{messages.consultations.localDate}</th>
                  <th>{messages.consultations.localStartTime}</th>
                  <th>{messages.consultations.localEndTime}</th>
                  <th>{messages.consultations.timezone}</th>
                  <th>{messages.consultations.durationMinutes}</th>
                  <th>{messages.consultations.createdAt}</th>
                </tr>
              </thead>
              <tbody>
                {detail.proposals.map((proposal) => (
                  <tr key={proposal.id}>
                    <td>
                      <RefId value={proposal.id} />
                    </td>
                    <td>
                      <ProposalStatusBadge status={proposal.status} />
                    </td>
                    <td>{formatDateTime(proposal.proposedStartAt)}</td>
                    <td>{formatDateTime(proposal.proposedEndAt)}</td>
                    <td>{dash(proposal.localDate)}</td>
                    <td>{dash(proposal.localStartTime)}</td>
                    <td>{dash(proposal.localEndTime)}</td>
                    <td>{dash(proposal.timezone)}</td>
                    <td>{proposal.durationMinutes}</td>
                    <td>{formatDateTime(proposal.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="stack">
        <h2>{messages.consultations.sectionAppointments}</h2>
        {detail.appointments.length === 0 ? (
          <StateBlock kind="empty" message={messages.consultations.none} />
        ) : (
          detail.appointments.map((appointment) => (
            <AppointmentSection
              key={appointment.id}
              appointment={appointment}
            />
          ))
        )}
      </section>

      <section className="panel">
        <h2>{messages.consultations.sectionNotes}</h2>
        <ul className="plain-list">
          {detail.notes.paymentCaptureDoesNotCreditWallet ? (
            <li>{messages.consultations.paymentNotSettlement}</li>
          ) : null}
          {detail.notes.refundObligationIsNotGatewayRefund ? (
            <li>{messages.consultations.obligationNotGatewayRefund}</li>
          ) : null}
          {detail.notes.readOnly ? (
            <li>{messages.consultations.readOnlyNote}</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
