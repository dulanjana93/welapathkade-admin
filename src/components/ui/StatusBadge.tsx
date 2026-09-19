'use client';

import type { AstrologerApplicationStatus, AstrologerProfileStatus, ServiceStatus } from '@/lib/types/api';

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
