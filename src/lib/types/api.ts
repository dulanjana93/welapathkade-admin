/** Types matching NestJS API responses (no invented fields). */

export type UserRole = 'PUBLIC' | 'ASTROLOGER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type Language = 'SI' | 'EN';

export type AstrologerApplicationStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'REJECTED'
  | 'APPROVED';

export type AstrologerProfileStatus = 'INACTIVE' | 'ACTIVE' | 'SUSPENDED';
export type AstrologerServiceStatus = 'ACTIVE' | 'INACTIVE';
export type ServiceStatus = 'ACTIVE' | 'INACTIVE';

/** Money amounts are decimal strings from the API (e.g. "1500.00"). */
export type MoneyString = string;

export type AuthUser = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  status: UserStatus;
  language: Language;
  referralCode: string;
  referredByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  profileStatus?: AstrologerProfileStatus | null;
  applicationStatus?: AstrologerApplicationStatus | null;
  rejectionReason?: string | null;
};

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
};

export type RequestOtpResponse = {
  message: string;
  purpose: string;
  expiresIn: number;
};

export type AdminAstrologerService = {
  id: string;
  serviceId: string;
  code: string;
  nameSi: string;
  nameEn: string;
  minPrice: MoneyString;
  maxPrice: MoneyString;
  price: MoneyString;
  status: AstrologerServiceStatus;
  serviceStatus: ServiceStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminAstrologerApplication = {
  id: string;
  status: AstrologerApplicationStatus;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
};

export type AdminAstrologerUser = {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  language: Language;
  referralCode: string;
  referredByUserId: string | null;
};

export type AdminAstrologerListItem = {
  id: string;
  displayName: string;
  bio: string | null;
  experienceYears: number;
  photo: string | null;
  city: string | null;
  district: string | null;
  status: AstrologerProfileStatus;
  createdAt: string;
  updatedAt: string;
  user: AdminAstrologerUser;
  application: AdminAstrologerApplication | null;
  services: AdminAstrologerService[];
};

export type AvailabilityWindow = {
  id: string;
  startTime: string;
  endTime: string;
};

export type AvailabilityException = {
  id: string;
  date: string;
  type: string;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminAstrologerAvailability = {
  timezone: string;
  weekly: Record<string, AvailabilityWindow[]>;
  exceptions: AvailabilityException[];
};

export type AdminAstrologerDetail = AdminAstrologerListItem & {
  availability: AdminAstrologerAvailability;
};

export type ReviewApplicationDto = {
  action: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
};

export type ReviewApplicationResponse = {
  applicationStatus: AstrologerApplicationStatus;
  profileStatus: AstrologerProfileStatus;
  rejectionReason: string | null;
};

export type AdminService = {
  id: string;
  code: string;
  nameSi: string;
  nameEn: string;
  descriptionSi: string | null;
  descriptionEn: string | null;
  minPrice: MoneyString;
  maxPrice: MoneyString;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateServiceDto = {
  code: string;
  nameSi: string;
  nameEn: string;
  descriptionSi?: string;
  descriptionEn?: string;
  minPrice: number;
  maxPrice: number;
  status?: ServiceStatus;
};

export type UpdateServiceDto = Partial<CreateServiceDto>;

export type AdminUserListItem = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  language: Language;
  referralCode: string;
  referredByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  astrologerProfileId: string | null;
  profileStatus: AstrologerProfileStatus | null;
  applicationStatus: AstrologerApplicationStatus | null;
};

export type AdminUserBankAccount = {
  id: string;
  bankName: string;
  accountHolderName: string;
  branchName: string;
  bankCode: string | null;
  branchCode: string | null;
  accountNumberMasked: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserDetail = AdminUserListItem & {
  referredBy: {
    id: string;
    name: string;
    role: UserRole;
    status: UserStatus;
  } | null;
  bankAccounts: AdminUserBankAccount[];
  bankAccountsNote: string;
};

export type UpdateUserStatusDto = {
  status: UserStatus;
};

export type CorrectReferralAttributionDto = {
  referrerUserId: string | null;
  reason: string;
};

export type CorrectReferralAttributionResult = {
  userId: string;
  referredByUserId: string | null;
  previousReferrerUserId: string | null;
  correctionId: string;
  auditLogId: string;
  correctedAt: string;
  reason: string;
};

export type ReferralKind = 'CUSTOMER' | 'ASTROLOGER';

export type ReferralAttributionFilter = 'ALL' | 'ATTRIBUTED' | 'UNATTRIBUTED';

export type AdminReferralReferrerSummary = {
  id: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  referralCode: string;
};

export type AdminReferralRelationship = {
  user: {
    id: string;
    name: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    referralCode: string;
    createdAt: string;
  };
  referredBy: AdminReferralReferrerSummary | null;
  referralKind: ReferralKind | null;
};

export type AdminReferralCorrection = {
  id: string;
  targetUserId: string;
  targetUser: {
    id: string;
    name: string;
    role: UserRole;
    referralCode: string;
  };
  previousReferrerUserId: string | null;
  previousReferrer: {
    id: string;
    name: string;
    role: UserRole;
    referralCode: string;
  } | null;
  newReferrerUserId: string | null;
  newReferrer: {
    id: string;
    name: string;
    role: UserRole;
    referralCode: string;
  } | null;
  adminUserId: string;
  adminName: string;
  reason: string;
  createdAt: string;
};

export type AdminResolvedReferrer = {
  id: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  referralCode: string;
};

export type FinancialSnapshotStatus = 'RECORDED' | 'POSTED' | 'REVERSED';

export type LedgerCategory =
  | 'ASTROLOGER_EARNING'
  | 'CUSTOMER_REFERRAL'
  | 'ASTROLOGER_REFERRAL'
  | 'PLATFORM_RESIDUAL';

export type LedgerEntryKind = 'CREDIT' | 'DEBIT';

export type FinanceIssueCode =
  | 'WALLET_BALANCE_MISMATCH'
  | 'PLATFORM_BALANCE_MISMATCH'
  | 'POSTED_INCOMPLETE_CREDITS'
  | 'REVERSED_INCOMPLETE_DEBITS'
  | 'RECORDED_UNEXPECTED_CREDITS'
  | 'REVERSAL_AMOUNT_MISMATCH'
  | 'ORPHAN_LEDGER_SNAPSHOT'
  | 'CUSTOMER_PAYOUT_UNPAYABLE';

export type RefundObligation = 'FULL_REFUND_DUE';

export type FinanceDateRangeQuery = {
  from?: string;
  to?: string;
};

export type FinancePaginationQuery = FinanceDateRangeQuery & {
  page?: number;
  pageSize?: number;
};

export type AdminLedgerQuery = FinancePaginationQuery & {
  userId?: string;
  appointmentId?: string;
  paymentId?: string;
  snapshotId?: string;
  category?: LedgerCategory;
  kind?: LedgerEntryKind;
};

export type AdminAttentionCasesQuery = FinancePaginationQuery;

export type FinanceSnapshotStatusBucket = {
  count: number;
  grossAmount: MoneyString;
};

export type FinanceLedgerCategoryBucket = {
  creditAmount: MoneyString;
  debitAmount: MoneyString;
  netAmount: MoneyString;
  creditCount: number;
  debitCount: number;
};

export type AdminFinanceOverview = {
  dateRange: {
    from: string | null;
    to: string | null;
    interval: 'UTC_HALF_OPEN';
  };
  notes: {
    postedDoesNotMeanWithdrawn: boolean;
    internalReversalIsNotExternalRefund: boolean;
    platformResidualIsNotUserWallet: boolean;
    withdrawalApprovalIsNotPayment?: boolean;
    withdrawalDebitIsNotEarningReversal?: boolean;
    withdrawalsAreAstrologerEarningsOnly?: boolean;
  };
  snapshotsByStatus: Record<
    FinancialSnapshotStatus,
    FinanceSnapshotStatusBucket
  >;
  postedGrossAmount: MoneyString;
  ledgerByCategory: Record<LedgerCategory, FinanceLedgerCategoryBucket>;
  refundObligations: {
    count: number;
    grossAmount: MoneyString;
    note: string;
  };
  manualReview: {
    count: number;
  };
  withdrawals?: AdminFinanceWithdrawalsOverview;
  customerReferralPayouts?: AdminFinanceWithdrawalsOverview;
  payoutsCombined?: AdminFinanceWithdrawalsOverview;
};

export type AdminLedgerEntry = {
  id: string;
  idempotencyKey: string;
  category: LedgerCategory;
  kind: LedgerEntryKind;
  amount: MoneyString;
  currency: string;
  userId: string | null;
  appointmentId: string;
  consultationId: string;
  paymentId: string;
  snapshotId: string;
  reversesEntryId: string | null;
  createdAt: string;
};

export type AdminLedgerList = {
  page: number;
  pageSize: number;
  total: number;
  items: AdminLedgerEntry[];
};

export type AdminFinanceIssue = {
  code: FinanceIssueCode;
  message: string;
  references: Record<string, string | null>;
};

export type AdminFinanceReconcile = {
  complete: boolean;
  scanned: {
    wallets: number;
    walletTotal: number;
    snapshots: number;
    snapshotTotal: number;
    recentLedgerEntries: number;
  };
  issueCount: number;
  issues: AdminFinanceIssue[];
  issuesTruncated: boolean;
  notes: {
    signConvention: string;
    recordedWithoutCreditsIsValid: boolean;
    noMutationsPerformed: boolean;
  };
};

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED';

export type AppointmentStatus =
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'PAYMENT_EXPIRED'
  | 'CANCELLED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED_BY_CUSTOMER'
  | 'CANCELLED_BY_ASTROLOGER'
  | 'NO_SHOW_CUSTOMER'
  | 'NO_SHOW_ASTROLOGER'
  | 'NO_SHOW_BOTH';

export type ConsultationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'COMPLETED';

export type AdminAttentionCasePayment = {
  id: string;
  status: PaymentStatus;
  amount: MoneyString;
  currency: string;
};

export type AdminAttentionCaseSnapshot = {
  id: string;
  status: FinancialSnapshotStatus;
  grossAmount: MoneyString;
  currency: string;
};

export type AdminAttentionCaseLedgerSummary = {
  creditCount: number;
  debitCount: number;
  hasCredits: boolean;
  hasReversals: boolean;
};

export type AdminAttentionCase = {
  appointmentId: string;
  consultationId: string;
  appointmentStatus: AppointmentStatus;
  consultationStatus: ConsultationStatus;
  amount: MoneyString;
  currency: string;
  refundObligation: RefundObligation | null;
  refundObligationRecordedAt: string | null;
  manualReviewRequired: boolean;
  cancelReason: string | null;
  cancelledAt: string | null;
  noShowRecordedAt: string | null;
  completedAt: string | null;
  payment: AdminAttentionCasePayment | null;
  snapshot: AdminAttentionCaseSnapshot | null;
  ledger: AdminAttentionCaseLedgerSummary;
  notes: {
    obligationIsNotExternalRefund: boolean;
    listingDoesNotMutateState: boolean;
  };
};

export type AdminAttentionCasesList = {
  page: number;
  pageSize: number;
  total: number;
  items: AdminAttentionCase[];
};

export type WithdrawalStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'CANCELLED';

export type WithdrawalPurpose = 'ASTROLOGER_EARNINGS' | 'CUSTOMER_REFERRAL';

export type WithdrawalEventAction =
  | 'CREATED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'CANCELLED';

export type AdminWithdrawalDestination = {
  bankName: string;
  accountHolderName: string;
  branchName: string;
  bankCode: string | null;
  branchCode: string | null;
  accountNumberMasked: string;
};

export type AdminWithdrawal = {
  id: string;
  amount: MoneyString;
  currency: string;
  status: WithdrawalStatus;
  purpose?: WithdrawalPurpose;
  createdAt: string;
  destination: AdminWithdrawalDestination;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  paidAt: string | null;
  transferReference: string | null;
  actualTransferredAt: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
};

export type AdminWithdrawalListItem = AdminWithdrawal & {
  userId: string;
  beneficiaryName?: string;
  astrologerName?: string;
  customerName?: string;
};

export type AdminWithdrawalsList = {
  page: number;
  pageSize: number;
  total: number;
  items: AdminWithdrawalListItem[];
};

export type AdminWithdrawalsQuery = FinancePaginationQuery & {
  status?: WithdrawalStatus;
  userId?: string;
  purpose?: WithdrawalPurpose;
};

export type AdminWithdrawalDebit = {
  id: string;
  amount: MoneyString;
  currency: string;
  createdAt: string;
};

export type AdminWithdrawalEvent = {
  id: string;
  action: WithdrawalEventAction;
  actorUserId: string | null;
  reason: string | null;
  createdAt: string;
};

export type AdminWithdrawalFunds = {
  availableBalance: MoneyString;
  reservedAmount: MoneyString;
  shortfallAmount: MoneyString;
};

export type AdminWithdrawalDetail = AdminWithdrawalListItem & {
  bankAccountId: string;
  debit: AdminWithdrawalDebit | null;
  events: AdminWithdrawalEvent[];
  funds?: AdminWithdrawalFunds;
};

export type RejectWithdrawalDto = {
  reason: string;
};

export type MarkWithdrawalPaidDto = {
  transferReference: string;
  actualTransferredAt: string;
};

export type FinanceWithdrawalStatusBucket = {
  count: number;
  amount: MoneyString;
};

export type AdminFinanceWithdrawalsOverview = {
  scope?:
    | 'ASTROLOGER_EARNINGS'
    | 'CUSTOMER_REFERRAL'
    | 'ASTROLOGER_EARNINGS_PLUS_CUSTOMER_REFERRAL';
  byStatus: Record<WithdrawalStatus, FinanceWithdrawalStatusBucket>;
  reservedAmount: MoneyString;
  paidAmount: MoneyString;
  debitCount: number;
  debitAmount: MoneyString;
  note: string;
};

export type ProposalStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'SUPERSEDED';

export type PayHereRefundStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REQUIRES_REVIEW';

export type PayHereRefundReason =
  | 'RESERVATION_EXPIRED'
  | 'CANCELLATION'
  | 'NO_SHOW'
  | 'ADMIN_RETRY';

export type AdminConsultationsQuery = FinancePaginationQuery & {
  status?: ConsultationStatus;
  customerId?: string;
  astrologerId?: string;
  q?: string;
  appointmentStatus?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  hasRefundObligation?: boolean;
  manualReviewRequired?: boolean;
};

export type AdminConsultationListCustomer = {
  id: string;
  name: string;
  phone: string;
};

export type AdminConsultationListAstrologer = {
  id: string;
  displayName: string;
  userId: string;
};

export type AdminConsultationListProposalSummary = {
  pendingProposal: {
    id: string;
    status: ProposalStatus;
    proposedStartAt: string;
    durationMinutes: number;
  } | null;
  acceptedProposal: {
    id: string;
    status: ProposalStatus;
    proposedStartAt: string;
    durationMinutes: number;
  } | null;
  totalCount: number;
};

export type AdminConsultationListPayment = {
  id: string;
  status: PaymentStatus;
  amount: MoneyString;
  currency: string;
  paidAt: string | null;
  provider: string;
};

export type AdminConsultationListAppointment = {
  id: string;
  status: AppointmentStatus;
  startAt: string;
  reservationExpiresAt: string;
  amount: MoneyString;
  currency: string;
  refundObligation: RefundObligation | null;
  manualReviewRequired: boolean;
  payment: AdminConsultationListPayment | null;
};

export type AdminConsultationListItem = {
  id: string;
  status: ConsultationStatus;
  submittedAt: string;
  expiresAt: string;
  respondedAt: string | null;
  completedAt: string | null;
  requestedPrice: MoneyString;
  currency: string;
  serviceNameEn: string;
  serviceNameSi: string;
  customer: AdminConsultationListCustomer;
  astrologer: AdminConsultationListAstrologer;
  proposal: AdminConsultationListProposalSummary;
  latestAppointment: AdminConsultationListAppointment | null;
  flags: {
    hasRefundObligation: boolean;
    manualReviewRequired: boolean;
    hasSnapshot: boolean;
  };
};

export type AdminConsultationsList = {
  page: number;
  pageSize: number;
  total: number;
  notes: {
    appointmentFiltersMatchAnyRelatedAppointment: boolean;
    listShowsLatestAppointmentByCreatedAt: boolean;
    readOnly: boolean;
  };
  items: AdminConsultationListItem[];
};

export type AdminConsultationProposal = {
  id: string;
  consultationId: string;
  proposedStartAt: string;
  proposedEndAt: string;
  durationMinutes: number;
  status: ProposalStatus;
  createdAt: string;
  respondedAt: string | null;
  localDate: string | null;
  localStartTime: string;
  localEndTime: string;
  timezone: string;
};

export type AdminConsultationPaymentAttempt = {
  id: string;
  merchantReference: string;
  providerPaymentId: string | null;
  status: PaymentStatus;
  provider: string;
  requiresReview: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminConsultationPayment = {
  id: string;
  status: PaymentStatus;
  provider: string;
  amount: MoneyString;
  currency: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  attempts: AdminConsultationPaymentAttempt[];
};

export type AdminConsultationRefund = {
  id: string;
  paymentId: string;
  appointmentId: string;
  payherePaymentId: string;
  payhereRefundNumber: string | null;
  amount: MoneyString;
  currency: string;
  status: PayHereRefundStatus;
  reason: PayHereRefundReason;
  retrySafe: boolean;
  failureMessage: string | null;
  providerStatus: number | null;
  sanitizedResponse: unknown;
  initiatedAt: string;
  lastReconciledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminConsultationSnapshot = {
  id: string;
  status: FinancialSnapshotStatus;
  currency: string;
  grossAmount: MoneyString;
  basis: string;
  astrologerId: string;
  astrologerPercent: string;
  astrologerAmount: MoneyString;
  customerReferrerUserId: string | null;
  customerReferralPercent: string;
  customerReferralAmount: MoneyString;
  astrologerReferrerUserId: string | null;
  astrologerReferralPercent: string;
  astrologerReferralAmount: MoneyString;
  platformPercent: string;
  platformAmount: MoneyString;
  completedAt: string;
  holdExpiresAt: string;
  postedAt: string | null;
  reversedAt: string | null;
  createdAt: string;
};

export type AdminConsultationLedgerEntry = {
  id: string;
  category: LedgerCategory;
  kind: LedgerEntryKind;
  amount: MoneyString;
  currency: string;
  userId: string | null;
  snapshotId: string;
  reversesEntryId: string | null;
  createdAt: string;
};

export type AdminConsultationAppointmentDetail = {
  id: string;
  consultationId: string;
  proposalId: string;
  customerId: string;
  astrologerId: string;
  status: AppointmentStatus;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  amount: MoneyString;
  currency: string;
  reservationExpiresAt: string;
  confirmedAt: string | null;
  sessionStartedAt: string | null;
  sessionEndedAt: string | null;
  actualDurationSeconds: number | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  noShowRecordedAt: string | null;
  refundObligation: RefundObligation | null;
  refundObligationRecordedAt: string | null;
  manualReviewRequired: boolean;
  createdAt: string;
  updatedAt: string;
  payment: AdminConsultationPayment | null;
  refunds: AdminConsultationRefund[];
  snapshot: AdminConsultationSnapshot | null;
  ledger: {
    creditCount: number;
    debitCount: number;
    hasCredits: boolean;
    hasReversals: boolean;
    entries: AdminConsultationLedgerEntry[];
  };
};

export type AdminConsultationDetail = {
  consultation: {
    id: string;
    status: ConsultationStatus;
    requestedPrice: MoneyString;
    currency: string;
    serviceNameSi: string;
    serviceNameEn: string;
    serviceId: string;
    astrologerServiceId: string;
    preferredStartAt: string;
    preferredEndAt: string | null;
    submittedAt: string;
    viewedAt: string | null;
    respondedAt: string | null;
    expiresAt: string;
    completedAt: string | null;
    declineReason: string | null;
    message: string | null;
    astrologerSummary: string | null;
    astrologerSummaryUpdatedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    role: UserRole;
    status: UserStatus;
  };
  astrologer: {
    id: string;
    displayName: string;
    status: AstrologerProfileStatus;
    city: string | null;
    district: string | null;
    userId: string;
    user: {
      id: string;
      name: string;
      phone: string;
      email: string | null;
      role: UserRole;
      status: UserStatus;
    };
  };
  service: {
    id: string;
    code: string;
    nameEn: string;
    nameSi: string;
    status: ServiceStatus;
  };
  proposals: AdminConsultationProposal[];
  pendingProposal: AdminConsultationProposal | null;
  acceptedProposal: AdminConsultationProposal | null;
  appointments: AdminConsultationAppointmentDetail[];
  notes: {
    refundObligationIsNotGatewayRefund: boolean;
    paymentCaptureDoesNotCreditWallet: boolean;
    readOnly: boolean;
  };
};
