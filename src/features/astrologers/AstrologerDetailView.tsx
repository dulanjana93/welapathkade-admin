'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StateBlock } from '@/components/ui/StateBlock';
import {
  ApplicationStatusBadge,
  ProfileStatusBadge,
  ServiceStatusBadge,
} from '@/components/ui/StatusBadge';
import { astrologersApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/errors';
import { formatDateTime, formatMoney } from '@/lib/format';
import { messages } from '@/lib/i18n/en';
import type { AdminAstrologerDetail } from '@/lib/types/api';

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export function AstrologerDetailView({ id }: { id: string }) {
  const [detail, setDetail] = useState<AdminAstrologerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await astrologersApi.get(id);
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
      await astrologersApi.review(id, { action: 'APPROVE' });
      setApproveOpen(false);
      setSuccess(messages.astrologers.approveSuccess);
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
      await astrologersApi.review(id, {
        action: 'REJECT',
        rejectionReason: rejectReason.trim(),
      });
      setRejectOpen(false);
      setRejectReason('');
      setSuccess(messages.astrologers.rejectSuccess);
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

  const canReview = detail.application?.status === 'PENDING_REVIEW';

  return (
    <div className="stack">
      <div className="toolbar">
        <Link href="/astrologers" className="link-btn">
          ← {messages.astrologers.back}
        </Link>
        <div className="row gap">
          <Button variant="secondary" onClick={() => void load()} disabled={submitting}>
            {messages.astrologers.refresh}
          </Button>
          {canReview ? (
            <>
              <Button
                onClick={() => {
                  setMutationError(null);
                  setApproveOpen(true);
                }}
                disabled={submitting}
              >
                {messages.astrologers.approve}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setMutationError(null);
                  setRejectOpen(true);
                }}
                disabled={submitting}
              >
                {messages.astrologers.reject}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {success ? <Alert tone="success">{success}</Alert> : null}
      {mutationError ? <Alert tone="error">{mutationError}</Alert> : null}

      <section className="panel">
        <h2>{messages.astrologers.sectionBasic}</h2>
        <dl className="detail-grid">
          <div>
            <dt>Name</dt>
            <dd>{detail.user.name}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{detail.user.phone}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{detail.user.role}</dd>
          </div>
          <div>
            <dt>Account status</dt>
            <dd>{detail.user.status}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2>{messages.astrologers.sectionProfile}</h2>
        <dl className="detail-grid">
          <div>
            <dt>Display name</dt>
            <dd>{detail.displayName}</dd>
          </div>
          <div>
            <dt>Profile status</dt>
            <dd>
              <ProfileStatusBadge status={detail.status} />
            </dd>
          </div>
          <div>
            <dt>Experience (years)</dt>
            <dd>{detail.experienceYears}</dd>
          </div>
          <div>
            <dt>City</dt>
            <dd>{detail.city || '—'}</dd>
          </div>
          <div>
            <dt>District</dt>
            <dd>{detail.district || '—'}</dd>
          </div>
          {detail.photo ? (
            <div>
              <dt>Photo</dt>
              <dd>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={detail.photo} alt="" className="profile-photo" />
              </dd>
            </div>
          ) : null}
          <div className="span-2">
            <dt>Bio</dt>
            <dd className="pre-wrap">{detail.bio || '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2>{messages.astrologers.sectionApplication}</h2>
        {detail.application ? (
          <dl className="detail-grid">
            <div>
              <dt>Application status</dt>
              <dd>
                <ApplicationStatusBadge status={detail.application.status} />
              </dd>
            </div>
            <div>
              <dt>Submitted</dt>
              <dd>{formatDateTime(detail.application.submittedAt)}</dd>
            </div>
            <div>
              <dt>Reviewed</dt>
              <dd>{formatDateTime(detail.application.reviewedAt)}</dd>
            </div>
            <div className="span-2">
              <dt>Rejection reason</dt>
              <dd className="pre-wrap">
                {detail.application.rejectionReason || '—'}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="muted">{messages.astrologers.noApplication}</p>
        )}
      </section>

      <section className="panel">
        <h2>{messages.astrologers.sectionServices}</h2>
        {detail.services.length === 0 ? (
          <p className="muted">{messages.astrologers.noServices}</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Price</th>
                  <th>Link status</th>
                  <th>Platform status</th>
                </tr>
              </thead>
              <tbody>
                {detail.services.map((svc) => (
                  <tr key={svc.id}>
                    <td>
                      <strong>{svc.nameEn}</strong>
                      <div className="muted tiny">{svc.nameSi}</div>
                    </td>
                    <td>{formatMoney(svc.price)}</td>
                    <td>
                      <ServiceStatusBadge status={svc.status} />
                    </td>
                    <td>
                      <ServiceStatusBadge status={svc.serviceStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>{messages.astrologers.sectionAvailability}</h2>
        <p className="muted tiny">Timezone: {detail.availability.timezone}</p>
        <div className="availability-grid">
          {DAY_ORDER.map((day) => {
            const windows = detail.availability.weekly[day] ?? [];
            return (
              <div key={day} className="availability-day">
                <strong>{day}</strong>
                {windows.length === 0 ? (
                  <p className="muted tiny">—</p>
                ) : (
                  windows.map((w) => (
                    <p key={w.id} className="tiny">
                      {w.startTime} – {w.endTime}
                    </p>
                  ))
                )}
              </div>
            );
          })}
        </div>
        <h3 className="subhead">Exceptions</h3>
        {detail.availability.exceptions.length === 0 ? (
          <p className="muted">{messages.astrologers.noExceptions}</p>
        ) : (
          <ul className="plain-list">
            {detail.availability.exceptions.map((ex) => (
              <li key={ex.id}>
                {ex.date} · {ex.type}
                {ex.startTime && ex.endTime
                  ? ` · ${ex.startTime}–${ex.endTime}`
                  : ''}
                {ex.reason ? ` · ${ex.reason}` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2>{messages.astrologers.sectionReferral}</h2>
        <dl className="detail-grid">
          <div>
            <dt>{messages.astrologers.referralCode}</dt>
            <dd>{detail.user.referralCode}</dd>
          </div>
          <div>
            <dt>{messages.astrologers.referredBy}</dt>
            <dd>
              {detail.user.referredByUserId
                ? detail.user.referredByUserId
                : messages.astrologers.noReferral}
            </dd>
          </div>
        </dl>
      </section>

      <Dialog
        open={approveOpen}
        title={messages.astrologers.approveTitle}
        onClose={() => (!submitting ? setApproveOpen(false) : undefined)}
        footer={
          <>
            <Button
              variant="ghost"
              disabled={submitting}
              onClick={() => setApproveOpen(false)}
            >
              {messages.astrologers.cancel}
            </Button>
            <Button loading={submitting} onClick={() => void onApprove()}>
              {messages.astrologers.confirmApprove}
            </Button>
          </>
        }
      >
        <p>{messages.astrologers.approveBody}</p>
      </Dialog>

      <Dialog
        open={rejectOpen}
        title={messages.astrologers.rejectTitle}
        onClose={() => (!submitting ? setRejectOpen(false) : undefined)}
        footer={
          <>
            <Button
              variant="ghost"
              disabled={submitting}
              onClick={() => setRejectOpen(false)}
            >
              {messages.astrologers.cancel}
            </Button>
            <Button
              variant="danger"
              loading={submitting}
              disabled={rejectReason.trim().length < 3}
              onClick={() => void onReject()}
            >
              {messages.astrologers.confirmReject}
            </Button>
          </>
        }
      >
        <label className="field">
          <span>{messages.astrologers.rejectReasonLabel}</span>
          <textarea
            rows={4}
            minLength={3}
            maxLength={2000}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={messages.astrologers.rejectReasonPlaceholder}
            disabled={submitting}
          />
        </label>
      </Dialog>
    </div>
  );
}
