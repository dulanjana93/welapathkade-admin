'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import {
  AppointmentStatusBadge,
  ConsultationStatusBadge,
  PaymentStatusBadge,
} from '@/components/ui/StatusBadge';
import {
  dateRangeToQuery,
  type DateRangeDraft,
} from '@/features/finance/FinanceDateRangeFields';
import { PaginationBar } from '@/features/finance/PaginationBar';
import { RefId } from '@/features/finance/RefId';
import { consultationsApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/errors';
import { formatDateTime, formatMoney } from '@/lib/format';
import { messages } from '@/lib/i18n/en';
import type {
  AdminConsultationsList,
  AppointmentStatus,
  ConsultationStatus,
  PaymentStatus,
} from '@/lib/types/api';

type TriFilter = 'ALL' | 'YES' | 'NO';

type ConsultationFilters = {
  q: string;
  status: ConsultationStatus | 'ALL';
  appointmentStatus: AppointmentStatus | 'ALL';
  paymentStatus: PaymentStatus | 'ALL';
  hasRefundObligation: TriFilter;
  manualReviewRequired: TriFilter;
  customerId: string;
  astrologerId: string;
  range: DateRangeDraft;
};

const CONSULTATION_STATUSES: Array<ConsultationStatus | 'ALL'> = [
  'ALL',
  'PENDING',
  'ACCEPTED',
  'DECLINED',
  'EXPIRED',
  'CANCELLED',
  'COMPLETED',
];

const APPOINTMENT_STATUSES: Array<AppointmentStatus | 'ALL'> = [
  'ALL',
  'PAYMENT_PENDING',
  'CONFIRMED',
  'PAYMENT_EXPIRED',
  'CANCELLED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED_BY_CUSTOMER',
  'CANCELLED_BY_ASTROLOGER',
  'NO_SHOW_CUSTOMER',
  'NO_SHOW_ASTROLOGER',
  'NO_SHOW_BOTH',
];

const PAYMENT_STATUSES: Array<PaymentStatus | 'ALL'> = [
  'ALL',
  'PENDING',
  'PAID',
  'FAILED',
  'EXPIRED',
  'CANCELLED',
];

const TRI_OPTIONS: TriFilter[] = ['ALL', 'YES', 'NO'];

const emptyFilters = (): ConsultationFilters => ({
  q: '',
  status: 'ALL',
  appointmentStatus: 'ALL',
  paymentStatus: 'ALL',
  hasRefundObligation: 'ALL',
  manualReviewRequired: 'ALL',
  customerId: '',
  astrologerId: '',
  range: { from: '', to: '' },
});

function triToBoolean(value: TriFilter): boolean | undefined {
  if (value === 'YES') return true;
  if (value === 'NO') return false;
  return undefined;
}

function filtersToQuery(
  filters: ConsultationFilters,
  page: number,
  pageSize: number,
) {
  const q = filters.q.trim().slice(0, 64);
  return {
    ...dateRangeToQuery(filters.range),
    page,
    pageSize,
    q: q || undefined,
    status: filters.status === 'ALL' ? undefined : filters.status,
    appointmentStatus:
      filters.appointmentStatus === 'ALL'
        ? undefined
        : filters.appointmentStatus,
    paymentStatus:
      filters.paymentStatus === 'ALL' ? undefined : filters.paymentStatus,
    hasRefundObligation: triToBoolean(filters.hasRefundObligation),
    manualReviewRequired: triToBoolean(filters.manualReviewRequired),
    customerId: filters.customerId.trim() || undefined,
    astrologerId: filters.astrologerId.trim() || undefined,
  };
}

function triLabel(value: TriFilter) {
  if (value === 'YES') return messages.consultations.filterYes;
  if (value === 'NO') return messages.consultations.filterNo;
  return messages.consultations.filterAll;
}

export function ConsultationsListView() {
  const [draft, setDraft] = useState<ConsultationFilters>(emptyFilters);
  const [applied, setApplied] = useState<ConsultationFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [result, setResult] = useState<AdminConsultationsList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await consultationsApi.list(
        filtersToQuery(applied, page, pageSize),
      );
      setResult(list);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setLoading(false);
    }
  }, [applied, page, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = () => {
    setApplied({
      ...draft,
      q: draft.q.slice(0, 64),
      range: { ...draft.range },
    });
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
      <Alert tone="info">{messages.consultations.intro}</Alert>
      <Alert tone="warning">{messages.consultations.filterMatchHint}</Alert>

      <div className="toolbar">
        <label className="field grow">
          <span>{messages.consultations.search}</span>
          <input
            value={draft.q}
            maxLength={64}
            placeholder={messages.consultations.searchPlaceholder}
            onChange={(e) => setDraft({ ...draft, q: e.target.value })}
          />
        </label>
        <label className="field inline">
          <span>{messages.consultations.consultationStatus}</span>
          <select
            value={draft.status}
            onChange={(e) =>
              setDraft({
                ...draft,
                status: e.target.value as ConsultationStatus | 'ALL',
              })
            }
          >
            {CONSULTATION_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value === 'ALL' ? messages.consultations.filterAll : value}
              </option>
            ))}
          </select>
        </label>
        <label className="field inline">
          <span>{messages.consultations.appointmentStatus}</span>
          <select
            value={draft.appointmentStatus}
            onChange={(e) =>
              setDraft({
                ...draft,
                appointmentStatus: e.target.value as AppointmentStatus | 'ALL',
              })
            }
          >
            {APPOINTMENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value === 'ALL' ? messages.consultations.filterAll : value}
              </option>
            ))}
          </select>
        </label>
        <label className="field inline">
          <span>{messages.consultations.paymentStatus}</span>
          <select
            value={draft.paymentStatus}
            onChange={(e) =>
              setDraft({
                ...draft,
                paymentStatus: e.target.value as PaymentStatus | 'ALL',
              })
            }
          >
            {PAYMENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value === 'ALL' ? messages.consultations.filterAll : value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="toolbar">
        <label className="field inline">
          <span>{messages.consultations.refundObligation}</span>
          <select
            value={draft.hasRefundObligation}
            onChange={(e) =>
              setDraft({
                ...draft,
                hasRefundObligation: e.target.value as TriFilter,
              })
            }
          >
            {TRI_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {triLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="field inline">
          <span>{messages.consultations.manualReview}</span>
          <select
            value={draft.manualReviewRequired}
            onChange={(e) =>
              setDraft({
                ...draft,
                manualReviewRequired: e.target.value as TriFilter,
              })
            }
          >
            {TRI_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {triLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="field inline">
          <span>{messages.consultations.submittedFrom}</span>
          <input
            type="datetime-local"
            value={draft.range.from}
            onChange={(e) =>
              setDraft({
                ...draft,
                range: { ...draft.range, from: e.target.value },
              })
            }
          />
        </label>
        <label className="field inline">
          <span>{messages.consultations.submittedTo}</span>
          <input
            type="datetime-local"
            value={draft.range.to}
            onChange={(e) =>
              setDraft({
                ...draft,
                range: { ...draft.range, to: e.target.value },
              })
            }
          />
        </label>
      </div>
      <p className="muted tiny">{messages.consultations.submittedRangeHint}</p>

      <details className="panel">
        <summary>{messages.consultations.advancedFilters}</summary>
        <div className="toolbar" style={{ marginTop: '0.75rem' }}>
          <label className="field grow">
            <span>{messages.consultations.customerId}</span>
            <input
              value={draft.customerId}
              onChange={(e) =>
                setDraft({ ...draft, customerId: e.target.value })
              }
            />
          </label>
          <label className="field grow">
            <span>{messages.consultations.astrologerId}</span>
            <input
              value={draft.astrologerId}
              onChange={(e) =>
                setDraft({ ...draft, astrologerId: e.target.value })
              }
            />
          </label>
        </div>
      </details>

      <div className="toolbar">
        <Button variant="secondary" onClick={applyFilters} disabled={loading}>
          {messages.consultations.applyFilters}
        </Button>
        <Button variant="secondary" onClick={clearFilters} disabled={loading}>
          {messages.consultations.clearFilters}
        </Button>
        <Button
          variant="secondary"
          onClick={() => void load()}
          disabled={loading}
        >
          {messages.consultations.refresh}
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
        <StateBlock kind="empty" message={messages.consultations.empty} />
      ) : null}

      {!loading && !error && result && result.items.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{messages.consultations.consultationId}</th>
                <th>{messages.consultations.submitted}</th>
                <th>{messages.consultations.customer}</th>
                <th>{messages.consultations.astrologer}</th>
                <th>{messages.consultations.service}</th>
                <th>{messages.consultations.requestedPrice}</th>
                <th>{messages.consultations.status}</th>
                <th>{messages.consultations.latestAppointment}</th>
                <th>{messages.consultations.latestPayment}</th>
                <th>{messages.consultations.warnings}</th>
                <th>{messages.consultations.open}</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((row) => {
                const latest = row.latestAppointment;
                const warnings: string[] = [];
                if (row.flags.hasRefundObligation) {
                  warnings.push(messages.consultations.warningRefundDue);
                }
                if (row.flags.manualReviewRequired) {
                  warnings.push(messages.consultations.warningManualReview);
                }
                if (row.flags.hasSnapshot) {
                  warnings.push(messages.consultations.warningHasSnapshot);
                }

                return (
                  <tr key={row.id}>
                    <td>
                      <RefId value={row.id} />
                    </td>
                    <td>{formatDateTime(row.submittedAt)}</td>
                    <td>
                      <Link href={`/users/${row.customer.id}`}>
                        {row.customer.name}
                      </Link>
                      <div className="muted tiny">{row.customer.phone}</div>
                    </td>
                    <td>
                      <Link href={`/astrologers/${row.astrologer.id}`}>
                        {row.astrologer.displayName}
                      </Link>
                    </td>
                    <td>
                      {row.serviceNameEn}
                      <div className="muted tiny">{row.serviceNameSi}</div>
                    </td>
                    <td>
                      {formatMoney(row.requestedPrice)} {row.currency}
                    </td>
                    <td>
                      <ConsultationStatusBadge status={row.status} />
                    </td>
                    <td>
                      {latest ? (
                        <AppointmentStatusBadge status={latest.status} />
                      ) : (
                        messages.consultations.none
                      )}
                    </td>
                    <td>
                      {latest?.payment ? (
                        <PaymentStatusBadge status={latest.payment.status} />
                      ) : (
                        messages.consultations.none
                      )}
                    </td>
                    <td>
                      {warnings.length > 0
                        ? warnings.join(' · ')
                        : messages.consultations.none}
                    </td>
                    <td>
                      <Link href={`/consultations/${row.id}`} className="link-btn">
                        {messages.consultations.open}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
