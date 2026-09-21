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
  UserRoleBadge,
  UserStatusBadge,
} from '@/components/ui/StatusBadge';
import { usersApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/errors';
import { formatDateTime } from '@/lib/format';
import { messages } from '@/lib/i18n/en';
import type { AdminUserDetail, UserStatus } from '@/lib/types/api';

const STATUS_OPTIONS: UserStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

export function UserDetailView({ id }: { id: string }) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<UserStatus>('ACTIVE');
  const [submitting, setSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.get(id);
      setDetail(data);
      setNextStatus(data.status);
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

  async function onUpdateStatus() {
    setSubmitting(true);
    setMutationError(null);
    setSuccess(null);
    try {
      await usersApi.updateStatus(id, { status: nextStatus });
      setStatusOpen(false);
      setSuccess(messages.users.statusSuccess);
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

  return (
    <div className="stack">
      <div className="toolbar">
        <Link href="/users" className="link-btn">
          ← {messages.users.back}
        </Link>
        <div className="row gap">
          <Button variant="secondary" onClick={() => void load()} disabled={submitting}>
            {messages.users.refresh}
          </Button>
          <Button
            onClick={() => {
              setMutationError(null);
              setNextStatus(detail.status);
              setStatusOpen(true);
            }}
            disabled={submitting}
          >
            {messages.users.changeStatus}
          </Button>
        </div>
      </div>

      {success ? <Alert tone="success">{success}</Alert> : null}
      {mutationError ? <Alert tone="error">{mutationError}</Alert> : null}

      <section className="panel">
        <h2>{messages.users.sectionAccount}</h2>
        <dl className="detail-grid">
          <div>
            <dt>{messages.users.name}</dt>
            <dd>{detail.name}</dd>
          </div>
          <div>
            <dt>{messages.users.role}</dt>
            <dd>
              <UserRoleBadge role={detail.role} />
            </dd>
          </div>
          <div>
            <dt>{messages.users.phone}</dt>
            <dd>{detail.phone}</dd>
          </div>
          <div>
            <dt>{messages.users.email}</dt>
            <dd>{detail.email || messages.users.noEmail}</dd>
          </div>
          <div>
            <dt>{messages.users.status}</dt>
            <dd>
              <UserStatusBadge status={detail.status} />
            </dd>
          </div>
          <div>
            <dt>{messages.users.language}</dt>
            <dd>{detail.language}</dd>
          </div>
          <div>
            <dt>{messages.users.createdAt}</dt>
            <dd>{formatDateTime(detail.createdAt)}</dd>
          </div>
          <div>
            <dt>{messages.users.updatedAt}</dt>
            <dd>{formatDateTime(detail.updatedAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2>{messages.users.sectionReferral}</h2>
        <dl className="detail-grid">
          <div>
            <dt>{messages.users.referralCode}</dt>
            <dd>{detail.referralCode}</dd>
          </div>
          <div>
            <dt>{messages.users.referredBy}</dt>
            <dd>
              {detail.referredBy ? (
                <Link href={`/users/${detail.referredBy.id}`}>
                  {detail.referredBy.name} ({detail.referredBy.role})
                </Link>
              ) : (
                messages.users.noReferral
              )}
            </dd>
          </div>
        </dl>
      </section>

      {detail.role === 'ASTROLOGER' ? (
        <section className="panel">
          <h2>{messages.users.sectionAstrologer}</h2>
          <dl className="detail-grid">
            <div>
              <dt>Profile status</dt>
              <dd>
                {detail.profileStatus ? (
                  <ProfileStatusBadge status={detail.profileStatus} />
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt>Application status</dt>
              <dd>
                {detail.applicationStatus ? (
                  <ApplicationStatusBadge status={detail.applicationStatus} />
                ) : (
                  '—'
                )}
              </dd>
            </div>
          </dl>
          {detail.astrologerProfileId ? (
            <p style={{ marginTop: '0.75rem' }}>
              <Link
                className="link-btn"
                href={`/astrologers/${detail.astrologerProfileId}`}
              >
                {messages.users.viewAstrologer}
              </Link>
            </p>
          ) : null}
        </section>
      ) : null}

      <Dialog
        open={statusOpen}
        title={messages.users.statusTitle}
        onClose={() => (!submitting ? setStatusOpen(false) : undefined)}
        footer={
          <>
            <Button
              variant="ghost"
              disabled={submitting}
              onClick={() => setStatusOpen(false)}
            >
              {messages.users.cancel}
            </Button>
            <Button
              loading={submitting}
              disabled={nextStatus === detail.status}
              onClick={() => void onUpdateStatus()}
            >
              {messages.users.confirmStatus}
            </Button>
          </>
        }
      >
        <p>{messages.users.statusBody}</p>
        <label className="field">
          <span>{messages.users.status}</span>
          <select
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value as UserStatus)}
            disabled={submitting}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </Dialog>
    </div>
  );
}
