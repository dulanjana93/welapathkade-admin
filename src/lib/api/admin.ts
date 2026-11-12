import { apiClient } from '@/lib/api/client';
import type {
  AdminAttentionCasesList,
  AdminAttentionCasesQuery,
  AdminConsultationDetail,
  AdminConsultationsList,
  AdminConsultationsQuery,
  AdminFinanceOverview,
  AdminFinanceReconcile,
  AdminLedgerList,
  AdminLedgerQuery,
  AdminWithdrawalDetail,
  AdminWithdrawalsList,
  AdminWithdrawalsQuery,
  MarkWithdrawalPaidDto,
  RejectWithdrawalDto,
  AdminAstrologerDetail,
  AdminAstrologerListItem,
  AdminService,
  AdminReferralCorrection,
  AdminReferralRelationship,
  AdminResolvedReferrer,
  AdminUserDetail,
  AdminUserListItem,
  AstrologerApplicationStatus,
  AuthUser,
  CorrectReferralAttributionDto,
  CorrectReferralAttributionResult,
  CreateServiceDto,
  FinanceDateRangeQuery,
  ReferralAttributionFilter,
  ReviewApplicationDto,
  ReviewApplicationResponse,
  UpdateServiceDto,
  UpdateUserStatusDto,
  UserRole,
  UserStatus,
} from '@/lib/types/api';

function financeQuery(
  query: Record<string, string | number | boolean | undefined>,
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      out[key] = String(value);
    }
  }
  return out;
}

export const authApi = {
  login(email: string, password: string) {
    return apiClient<{ user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  me() {
    return apiClient<AuthUser>('/auth/me');
  },

  logout() {
    return apiClient<{ ok: boolean }>('/auth/logout', { method: 'POST' });
  },
};

export const astrologersApi = {
  list(applicationStatus?: AstrologerApplicationStatus) {
    return apiClient<AdminAstrologerListItem[]>('/admin/astrologers', {
      query: { applicationStatus },
    });
  },

  get(id: string) {
    return apiClient<AdminAstrologerDetail>(`/admin/astrologers/${id}`);
  },

  review(id: string, dto: ReviewApplicationDto) {
    return apiClient<ReviewApplicationResponse>(
      `/admin/astrologers/${id}/application`,
      { method: 'PATCH', body: dto },
    );
  },
};

export const servicesApi = {
  list() {
    return apiClient<AdminService[]>('/admin/services');
  },

  create(dto: CreateServiceDto) {
    return apiClient<AdminService>('/admin/services', {
      method: 'POST',
      body: dto,
    });
  },

  update(id: string, dto: UpdateServiceDto) {
    return apiClient<AdminService>(`/admin/services/${id}`, {
      method: 'PATCH',
      body: dto,
    });
  },
};

export const usersApi = {
  list(filters?: { role?: UserRole; status?: UserStatus }) {
    return apiClient<AdminUserListItem[]>('/admin/users', {
      query: {
        role: filters?.role,
        status: filters?.status,
      },
    });
  },

  get(id: string) {
    return apiClient<AdminUserDetail>(`/admin/users/${id}`);
  },

  updateStatus(id: string, dto: UpdateUserStatusDto) {
    return apiClient<AdminUserListItem>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: dto,
    });
  },

  correctReferralAttribution(
    id: string,
    dto: CorrectReferralAttributionDto,
  ) {
    return apiClient<CorrectReferralAttributionResult>(
      `/admin/users/${id}/referral-attribution`,
      {
        method: 'PATCH',
        body: dto,
      },
    );
  },
};

export const referralsApi = {
  list(filters?: {
    role?: Extract<UserRole, 'PUBLIC' | 'ASTROLOGER'>;
    attribution?: ReferralAttributionFilter;
  }) {
    return apiClient<AdminReferralRelationship[]>('/admin/referrals', {
      query: {
        role: filters?.role,
        attribution: filters?.attribution,
      },
    });
  },

  corrections(limit?: number) {
    return apiClient<AdminReferralCorrection[]>('/admin/referrals/corrections', {
      query: { limit: limit === undefined ? undefined : String(limit) },
    });
  },

  resolveCode(code: string) {
    return apiClient<AdminResolvedReferrer>('/admin/referrals/resolve-code', {
      query: { code },
    });
  },
};

export const financeApi = {
  overview(query?: FinanceDateRangeQuery) {
    return apiClient<AdminFinanceOverview>('/admin/finance/overview', {
      query: financeQuery(query ?? {}),
    });
  },

  ledger(query?: AdminLedgerQuery) {
    return apiClient<AdminLedgerList>('/admin/finance/ledger', {
      query: financeQuery(query ?? {}),
    });
  },

  reconcile() {
    return apiClient<AdminFinanceReconcile>('/admin/finance/reconcile');
  },

  attentionCases(query?: AdminAttentionCasesQuery) {
    return apiClient<AdminAttentionCasesList>('/admin/finance/attention-cases', {
      query: financeQuery(query ?? {}),
    });
  },

  withdrawals(query?: AdminWithdrawalsQuery) {
    return apiClient<AdminWithdrawalsList>('/admin/finance/withdrawals', {
      query: financeQuery(query ?? {}),
    });
  },

  withdrawal(id: string) {
    return apiClient<AdminWithdrawalDetail>(`/admin/finance/withdrawals/${id}`);
  },

  approveWithdrawal(id: string) {
    return apiClient<AdminWithdrawalDetail>(
      `/admin/finance/withdrawals/${id}/approve`,
      { method: 'POST' },
    );
  },

  rejectWithdrawal(id: string, dto: RejectWithdrawalDto) {
    return apiClient<AdminWithdrawalDetail>(
      `/admin/finance/withdrawals/${id}/reject`,
      { method: 'POST', body: dto },
    );
  },

  markWithdrawalPaid(id: string, dto: MarkWithdrawalPaidDto) {
    return apiClient<AdminWithdrawalDetail>(
      `/admin/finance/withdrawals/${id}/mark-paid`,
      { method: 'POST', body: dto },
    );
  },

  cancelWithdrawal(id: string, dto: RejectWithdrawalDto) {
    return apiClient<AdminWithdrawalDetail>(
      `/admin/finance/withdrawals/${id}/cancel`,
      { method: 'POST', body: dto },
    );
  },
};

export const consultationsApi = {
  list(query?: AdminConsultationsQuery) {
    return apiClient<AdminConsultationsList>('/admin/consultations', {
      query: financeQuery(query ?? {}),
    });
  },

  get(id: string) {
    return apiClient<AdminConsultationDetail>(
      `/admin/consultations/${encodeURIComponent(id)}`,
    );
  },
};
