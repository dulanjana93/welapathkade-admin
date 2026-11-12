'use client';

import { useEffect, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { referralsApi, usersApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/errors';
import { messages } from '@/lib/i18n/en';
import type {
  AdminResolvedReferrer,
  UserRole,
  UserStatus,
} from '@/lib/types/api';

type CurrentReferrer = {
  id: string;
  name: string;
  role: UserRole;
  status?: UserStatus;
  referralCode?: string;
} | null;

type Props = {
  open: boolean;
  targetUserId: string;
  targetUserName: string;
  currentReferrer: CurrentReferrer;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
};

export function CorrectReferralDialog({
  open,
  targetUserId,
  targetUserName,
  currentReferrer,
  onClose,
  onSuccess,
}: Props) {
  const [referrerCode, setReferrerCode] = useState('');
  const [referrerUserId, setReferrerUserId] = useState('');
  const [clearAttribution, setClearAttribution] = useState(false);
  const [reason, setReason] = useState('');
  const [resolved, setResolved] = useState<AdminResolvedReferrer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setReferrerCode('');
    setReferrerUserId(currentReferrer?.id ?? '');
    setClearAttribution(false);
    setReason('');
    setResolved(null);
    setError(null);
    setSubmitting(false);
    setResolving(false);
  }, [open, currentReferrer?.id]);

  async function onResolveCode() {
    setResolving(true);
    setError(null);
    try {
      const row = await referralsApi.resolveCode(referrerCode.trim());
      setResolved(row);
      setReferrerUserId(row.id);
      setClearAttribution(false);
    } catch (err) {
      setResolved(null);
      setError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setResolving(false);
    }
  }

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const nextReferrerUserId = clearAttribution
        ? null
        : referrerUserId.trim() || null;
      if (!clearAttribution && !nextReferrerUserId) {
        setError(messages.common.validationError);
        setSubmitting(false);
        return;
      }
      if (!reason.trim()) {
        setError(messages.common.validationError);
        setSubmitting(false);
        return;
      }

      await usersApi.correctReferralAttribution(targetUserId, {
        referrerUserId: nextReferrerUserId,
        reason: reason.trim(),
      });
      await onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      title={messages.referrals.correctTitle}
      onClose={() => (!submitting ? onClose() : undefined)}
      footer={
        <>
          <Button
            variant="ghost"
            disabled={submitting}
            onClick={onClose}
          >
            {messages.referrals.cancel}
          </Button>
          <Button
            loading={submitting}
            disabled={submitting || !reason.trim()}
            onClick={() => void onSubmit()}
          >
            {messages.referrals.confirmCorrect}
          </Button>
        </>
      }
    >
      <p>
        {messages.referrals.correctBody} ({targetUserName})
      </p>
      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="stack gap">
        <div>
          <span className="muted tiny">{messages.referrals.currentReferrer}</span>
          <p>
            {currentReferrer
              ? `${currentReferrer.name} (${currentReferrer.role}${
                  currentReferrer.referralCode
                    ? ` · ${currentReferrer.referralCode}`
                    : ''
                })`
              : messages.referrals.none}
          </p>
        </div>

        <label className="field">
          <span>{messages.referrals.referrerCode}</span>
          <div className="row gap">
            <input
              value={referrerCode}
              onChange={(e) => setReferrerCode(e.target.value)}
              disabled={submitting || clearAttribution || resolving}
              placeholder={messages.referrals.referrerCodeHint}
            />
            <Button
              variant="secondary"
              disabled={
                submitting ||
                clearAttribution ||
                resolving ||
                !referrerCode.trim()
              }
              loading={resolving}
              onClick={() => void onResolveCode()}
            >
              {messages.referrals.resolveCode}
            </Button>
          </div>
        </label>

        {resolved ? (
          <p className="muted">
            {messages.referrals.resolvedAs}: {resolved.name} ({resolved.role} ·{' '}
            {resolved.referralCode})
          </p>
        ) : null}

        <label className="field">
          <span>{messages.referrals.referrerUserId}</span>
          <input
            value={referrerUserId}
            onChange={(e) => {
              setReferrerUserId(e.target.value);
              setResolved(null);
            }}
            disabled={submitting || clearAttribution}
            placeholder={messages.referrals.referrerUserIdHint}
          />
        </label>

        <label className="row gap" style={{ alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={clearAttribution}
            disabled={submitting}
            onChange={(e) => {
              setClearAttribution(e.target.checked);
              if (e.target.checked) {
                setResolved(null);
              }
            }}
          />
          <span>{messages.referrals.clearAttribution}</span>
        </label>

        <label className="field">
          <span>{messages.referrals.reason}</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={submitting}
            rows={3}
            maxLength={500}
            placeholder={messages.referrals.reasonPlaceholder}
          />
        </label>
      </div>
    </Dialog>
  );
}
