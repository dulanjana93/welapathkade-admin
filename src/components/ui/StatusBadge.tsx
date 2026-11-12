'use client';

import type {
  AppointmentStatus,
  AstrologerApplicationStatus,
  AstrologerProfileStatus,
  ConsultationStatus,
  FinancialSnapshotStatus,
  LedgerEntryKind,
  PayHereRefundStatus,
  PaymentStatus,
  ProposalStatus,
  RefundObligation,
  ServiceStatus,
  UserRole,
  UserStatus,
} from '@/lib/types/api';

const APP_CLASS: Record<AstrologerApplicationStatus, string> = {
  DRAFT: 'badge-neutral',
  PENDING_REVIEW: 'badge-warn',
  REJECTED: 'badge-danger',
  APPROVED: 'badge-success',
};

const PROFILE_CLASS: Record<AstrologerProfileStatus, string> = {
  INACTIVE: 'badge-neutral',
  ACTIVE: 'badge-success',
  SUSPENDED: 'badge-danger',
};

const SERVICE_CLASS: Record<ServiceStatus, string> = {
  ACTIVE: 'badge-success',
  INACTIVE: 'badge-neutral',
};

export function ApplicationStatusBadge({
  status,
}: {
  status: AstrologerApplicationStatus;
}) {
  return <span className={`badge ${APP_CLASS[status]}`}>{status}</span>;
}

export function ProfileStatusBadge({ status }: { status: AstrologerProfileStatus }) {
  return <span className={`badge ${PROFILE_CLASS[status]}`}>{status}</span>;
}

export function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  return <span className={`badge ${SERVICE_CLASS[status]}`}>{status}</span>;
}

const USER_STATUS_CLASS: Record<UserStatus, string> = {
  ACTIVE: 'badge-success',
  INACTIVE: 'badge-neutral',
  SUSPENDED: 'badge-danger',
};

const USER_ROLE_CLASS: Record<UserRole, string> = {
  PUBLIC: 'badge-neutral',
  ASTROLOGER: 'badge-warn',
  ADMIN: 'badge-success',
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <span className={`badge ${USER_STATUS_CLASS[status]}`}>{status}</span>;
}

export function UserRoleBadge({ role }: { role: UserRole }) {
  return <span className={`badge ${USER_ROLE_CLASS[role]}`}>{role}</span>;
}

const CONSULTATION_CLASS: Record<ConsultationStatus, string> = {
  PENDING: 'badge-warn',
  ACCEPTED: 'badge-success',
  DECLINED: 'badge-danger',
  EXPIRED: 'badge-neutral',
  CANCELLED: 'badge-danger',
  COMPLETED: 'badge-success',
};

const APPOINTMENT_CLASS: Record<AppointmentStatus, string> = {
  PAYMENT_PENDING: 'badge-warn',
  CONFIRMED: 'badge-success',
  PAYMENT_EXPIRED: 'badge-neutral',
  CANCELLED: 'badge-danger',
  IN_PROGRESS: 'badge-warn',
  COMPLETED: 'badge-success',
  CANCELLED_BY_CUSTOMER: 'badge-danger',
  CANCELLED_BY_ASTROLOGER: 'badge-danger',
  NO_SHOW_CUSTOMER: 'badge-danger',
  NO_SHOW_ASTROLOGER: 'badge-danger',
  NO_SHOW_BOTH: 'badge-danger',
};

const PAYMENT_CLASS: Record<PaymentStatus, string> = {
  PENDING: 'badge-warn',
  PAID: 'badge-success',
  FAILED: 'badge-danger',
  EXPIRED: 'badge-neutral',
  CANCELLED: 'badge-danger',
};

const PROPOSAL_CLASS: Record<ProposalStatus, string> = {
  PENDING: 'badge-warn',
  ACCEPTED: 'badge-success',
  REJECTED: 'badge-danger',
  SUPERSEDED: 'badge-neutral',
};

const PAYHERE_REFUND_CLASS: Record<PayHereRefundStatus, string> = {
  PENDING: 'badge-warn',
  PROCESSING: 'badge-warn',
  SUCCEEDED: 'badge-success',
  FAILED: 'badge-danger',
  REQUIRES_REVIEW: 'badge-warn',
};

const SNAPSHOT_CLASS: Record<FinancialSnapshotStatus, string> = {
  RECORDED: 'badge-warn',
  POSTED: 'badge-success',
  REVERSED: 'badge-danger',
};

const LEDGER_KIND_CLASS: Record<LedgerEntryKind, string> = {
  CREDIT: 'badge-success',
  DEBIT: 'badge-danger',
};

export function ConsultationStatusBadge({
  status,
}: {
  status: ConsultationStatus;
}) {
  return <span className={`badge ${CONSULTATION_CLASS[status]}`}>{status}</span>;
}

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  return <span className={`badge ${APPOINTMENT_CLASS[status]}`}>{status}</span>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={`badge ${PAYMENT_CLASS[status]}`}>{status}</span>;
}

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  return <span className={`badge ${PROPOSAL_CLASS[status]}`}>{status}</span>;
}

export function RefundObligationBadge({
  status,
}: {
  status: RefundObligation;
}) {
  return <span className="badge badge-warn">{status}</span>;
}

export function PayHereRefundStatusBadge({
  status,
}: {
  status: PayHereRefundStatus;
}) {
  return (
    <span className={`badge ${PAYHERE_REFUND_CLASS[status]}`}>{status}</span>
  );
}

export function FinancialSnapshotStatusBadge({
  status,
}: {
  status: FinancialSnapshotStatus;
}) {
  return <span className={`badge ${SNAPSHOT_CLASS[status]}`}>{status}</span>;
}

export function LedgerEntryKindBadge({ kind }: { kind: LedgerEntryKind }) {
  return <span className={`badge ${LEDGER_KIND_CLASS[kind]}`}>{kind}</span>;
}
