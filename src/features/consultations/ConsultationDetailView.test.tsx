import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsultationDetailView } from '@/features/consultations/ConsultationDetailView';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

function mockJson(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(data),
  };
}

function proposal(overrides: Record<string, unknown> = {}) {
  return {
    id: 'p1',
    consultationId: 'c1',
    proposedStartAt: '2026-03-05T10:00:00.000Z',
    proposedEndAt: '2026-03-05T10:30:00.000Z',
    durationMinutes: 30,
    status: 'ACCEPTED',
    createdAt: '2026-03-01T12:00:00.000Z',
    respondedAt: '2026-03-01T12:30:00.000Z',
    localDate: '2026-03-05',
    localStartTime: '15:30',
    localEndTime: '16:00',
    timezone: 'Asia/Colombo',
    ...overrides,
  };
}

function appointment(overrides: Record<string, unknown> = {}) {
  return {
    id: 'a1',
    consultationId: 'c1',
    proposalId: 'p1',
    customerId: 'u-customer-1',
    astrologerId: 'ap1',
    status: 'COMPLETED',
    startAt: '2026-03-05T10:00:00.000Z',
    endAt: '2026-03-05T10:30:00.000Z',
    durationMinutes: 30,
    amount: '2500.00',
    currency: 'LKR',
    reservationExpiresAt: '2026-03-04T10:00:00.000Z',
    confirmedAt: '2026-03-03T10:00:00.000Z',
    sessionStartedAt: '2026-03-05T10:00:00.000Z',
    sessionEndedAt: '2026-03-05T10:28:00.000Z',
    actualDurationSeconds: 1680,
    cancelledAt: null,
    cancelReason: null,
    noShowRecordedAt: null,
    refundObligation: null,
    refundObligationRecordedAt: null,
    manualReviewRequired: false,
    createdAt: '2026-03-02T10:00:00.000Z',
    updatedAt: '2026-03-05T10:28:00.000Z',
    payment: {
      id: 'pay1',
      status: 'PAID',
      provider: 'PAYHERE',
      amount: '2500.00',
      currency: 'LKR',
      paidAt: '2026-03-03T10:00:00.000Z',
      createdAt: '2026-03-02T10:05:00.000Z',
      updatedAt: '2026-03-03T10:00:00.000Z',
      attempts: [
        {
          id: 'att1',
          merchantReference: 'MR-1',
          providerPaymentId: 'PH-1',
          status: 'PAID',
          provider: 'PAYHERE',
          requiresReview: false,
          createdAt: '2026-03-02T10:05:00.000Z',
          updatedAt: '2026-03-03T10:00:00.000Z',
        },
      ],
    },
    refunds: [],
    snapshot: {
      id: 'snap1',
      status: 'POSTED',
      currency: 'LKR',
      grossAmount: '2500.00',
      basis: 'GROSS',
      astrologerId: 'ap1',
      astrologerPercent: '70.00',
      astrologerAmount: '1750.00',
      customerReferrerUserId: null,
      customerReferralPercent: '0.00',
      customerReferralAmount: '0.00',
      astrologerReferrerUserId: null,
      astrologerReferralPercent: '0.00',
      astrologerReferralAmount: '0.00',
      platformPercent: '30.00',
      platformAmount: '750.00',
      completedAt: '2026-03-05T10:28:00.000Z',
      holdExpiresAt: '2026-03-12T10:28:00.000Z',
      postedAt: '2026-03-12T10:28:00.000Z',
      reversedAt: null,
      createdAt: '2026-03-05T10:28:00.000Z',
    },
    ledger: {
      creditCount: 1,
      debitCount: 0,
      hasCredits: true,
      hasReversals: false,
      entries: [
        {
          id: 'le1',
          category: 'ASTROLOGER_EARNINGS',
          kind: 'CREDIT',
          amount: '1750.00',
          currency: 'LKR',
          userId: 'u-astro-1',
          snapshotId: 'snap1',
          reversesEntryId: null,
          createdAt: '2026-03-12T10:28:00.000Z',
        },
      ],
    },
    ...overrides,
  };
}

function detailResponse(overrides: Record<string, unknown> = {}) {
  return {
    consultation: {
      id: 'c1',
      status: 'COMPLETED',
      requestedPrice: '2500.00',
      currency: 'LKR',
      serviceNameSi: 'ජන්ම පත්‍රය',
      serviceNameEn: 'Birth chart',
      serviceId: 'svc1',
      astrologerServiceId: 'as1',
      preferredStartAt: '2026-03-05T10:00:00.000Z',
      preferredEndAt: null,
      submittedAt: '2026-03-01T10:00:00.000Z',
      viewedAt: '2026-03-01T10:30:00.000Z',
      respondedAt: '2026-03-01T11:00:00.000Z',
      expiresAt: '2026-03-02T10:00:00.000Z',
      completedAt: '2026-03-05T10:28:00.000Z',
      declineReason: null,
      message: 'Please focus on career',
      astrologerSummary: 'Strong career period ahead',
      astrologerSummaryUpdatedAt: '2026-03-05T10:28:00.000Z',
      createdAt: '2026-03-01T10:00:00.000Z',
      updatedAt: '2026-03-05T10:28:00.000Z',
    },
    customer: {
      id: 'u-customer-1',
      name: 'Amal Perera',
      phone: '+94771110001',
      email: 'amal@example.com',
      role: 'PUBLIC',
      status: 'ACTIVE',
    },
    astrologer: {
      id: 'ap1',
      displayName: 'Nimal Astro',
      status: 'ACTIVE',
      city: 'Kandy',
      district: 'Kandy',
      userId: 'u-astro-1',
      user: {
        id: 'u-astro-1',
        name: 'Nimal',
        phone: '+94772220002',
        email: null,
        role: 'ASTROLOGER',
        status: 'ACTIVE',
      },
    },
    service: {
      id: 'svc1',
      code: 'BIRTH_CHART',
      nameEn: 'Birth chart',
      nameSi: 'ජන්ම පත්‍රය',
      status: 'ACTIVE',
    },
    proposals: [
      proposal({ id: 'p0', status: 'SUPERSEDED' }),
      proposal(),
    ],
    pendingProposal: null,
    acceptedProposal: proposal(),
    appointments: [appointment()],
    notes: {
      refundObligationIsNotGatewayRefund: true,
      paymentCaptureDoesNotCreditWallet: true,
      readOnly: true,
    },
    ...overrides,
  };
}

describe('ConsultationDetailView', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders main sections without mutation controls', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(detailResponse())));
    render(<ConsultationDetailView id="c1" />);

    expect(await screen.findByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Customer and astrologer')).toBeInTheDocument();
    expect(screen.getByText('Service and pricing')).toBeInTheDocument();
    expect(screen.getByText('Proposals')).toBeInTheDocument();
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.getByText('Please focus on career')).toBeInTheDocument();
    expect(screen.getByText('Strong career period ahead')).toBeInTheDocument();
    expect(screen.getByText('BIRTH_CHART')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open user/i })).toHaveAttribute(
      'href',
      '/users/u-customer-1',
    );
    expect(
      screen.getByRole('link', { name: /open astrologer/i }),
    ).toHaveAttribute('href', '/astrologers/ap1');
    expect(
      screen.getAllByText(/does not credit the astrologer wallet/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByRole('button', { name: /approve|reject|mark paid|cancel/i }),
    ).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/consultations/c1',
      expect.any(Object),
    );
  });

  it('shows multiple appointments and proposals', async () => {
    const older = appointment({
      id: 'a0',
      status: 'CANCELLED',
      payment: null,
      snapshot: null,
      ledger: {
        creditCount: 0,
        debitCount: 0,
        hasCredits: false,
        hasReversals: false,
        entries: [],
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockJson(
          detailResponse({
            appointments: [appointment(), older],
            proposals: [
              proposal({ id: 'p2', status: 'PENDING' }),
              proposal({ id: 'p1', status: 'ACCEPTED' }),
            ],
            pendingProposal: proposal({ id: 'p2', status: 'PENDING' }),
          }),
        ),
      ),
    );
    render(<ConsultationDetailView id="c1" />);
    expect(await screen.findByText('Pending proposal')).toBeInTheDocument();
    expect(screen.getAllByText('COMPLETED').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CANCELLED').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ACCEPTED').length).toBeGreaterThan(0);
  });

  it('explains refund obligation without PayHere refunds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockJson(
          detailResponse({
            appointments: [
              appointment({
                status: 'CANCELLED_BY_CUSTOMER',
                refundObligation: 'FULL_REFUND_DUE',
                refundObligationRecordedAt: '2026-03-04T10:00:00.000Z',
                refunds: [],
                snapshot: null,
                ledger: {
                  creditCount: 0,
                  debitCount: 0,
                  hasCredits: false,
                  hasReversals: false,
                  entries: [],
                },
              }),
            ],
          }),
        ),
      ),
    );
    render(<ConsultationDetailView id="c1" />);
    expect(await screen.findByText('FULL_REFUND_DUE')).toBeInTheDocument();
    expect(
      screen.getByText(/refund obligation is recorded, but no PayHere refund attempt exists/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/No PayHere refund records/i)).toBeInTheDocument();
  });

  it('keeps payment, snapshot, and ledger distinct with percent labels', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(detailResponse())));
    render(<ConsultationDetailView id="c1" />);

    expect((await screen.findAllByText('PAID')).length).toBeGreaterThan(0);
    expect(screen.getByText('Financial snapshot')).toBeInTheDocument();
    expect(screen.getByText('POSTED')).toBeInTheDocument();
    expect(screen.getByText('Ledger')).toBeInTheDocument();
    expect(screen.getByText('Credit entries')).toBeInTheDocument();
    expect(screen.getByText('Debit entries')).toBeInTheDocument();
    expect(screen.getByText('CREDIT')).toBeInTheDocument();
    expect(screen.getByText(/70\.00%/)).toBeInTheDocument();
    expect(screen.getByText(/30\.00%/)).toBeInTheDocument();
    expect(
      screen.getAllByText(/Payment capture does not credit the astrologer wallet/i)
        .length,
    ).toBeGreaterThan(0);
  });

  it('uses distinct amount labels for appointment, payment, and consultation price', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(detailResponse())));
    render(<ConsultationDetailView id="c1" />);

    expect(
      await screen.findByText('Requested consultation price'),
    ).toBeInTheDocument();
    expect(screen.getByText('Appointment amount')).toBeInTheDocument();
    expect(screen.getByText('Payment amount')).toBeInTheDocument();
    expect(screen.getByText('Ledger entry amount')).toBeInTheDocument();
  });

  it('shows ledger summary translations', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(detailResponse())));
    render(<ConsultationDetailView id="c1" />);

    expect(await screen.findByText(/Credits:/)).toBeInTheDocument();
    expect(screen.getByText(/Debits:/)).toBeInTheDocument();
    expect(screen.getByText(/Credit count:/)).toBeInTheDocument();
    expect(screen.getByText(/Debit count:/)).toBeInTheDocument();
    expect(screen.getByText(/Has credits:/)).toBeInTheDocument();
    expect(screen.getByText(/Has reversals:/)).toBeInTheDocument();
  });

  it('shows proposal local date, times, and timezone from the API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(detailResponse())));
    render(<ConsultationDetailView id="c1" />);

    expect((await screen.findAllByText('Local date')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('2026-03-05').length).toBeGreaterThan(0);
    expect(screen.getAllByText('15:30').length).toBeGreaterThan(0);
    expect(screen.getAllByText('16:00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Asia/Colombo').length).toBeGreaterThan(0);
  });

  it('shows PayHere refund number and timestamps when present', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockJson(
          detailResponse({
            appointments: [
              appointment({
                refunds: [
                  {
                    id: 'rf1',
                    paymentId: 'pay1',
                    appointmentId: 'a1',
                    payherePaymentId: 'PH-PAY-1',
                    payhereRefundNumber: 'PH-REF-99',
                    amount: '2500.00',
                    currency: 'LKR',
                    status: 'SUCCEEDED',
                    reason: 'CANCELLATION',
                    retrySafe: false,
                    failureMessage: null,
                    providerStatus: 2,
                    sanitizedResponse: { ignored: true },
                    initiatedAt: '2026-03-04T11:00:00.000Z',
                    lastReconciledAt: '2026-03-04T11:05:00.000Z',
                    completedAt: '2026-03-04T11:10:00.000Z',
                    createdAt: '2026-03-04T11:00:00.000Z',
                    updatedAt: '2026-03-04T11:10:00.000Z',
                  },
                ],
              }),
            ],
          }),
        ),
      ),
    );
    render(<ConsultationDetailView id="c1" />);

    expect(await screen.findByText('Refund amount')).toBeInTheDocument();
    expect(screen.getByText('PayHere refund number')).toBeInTheDocument();
    expect(screen.getByText('PH-REF-99')).toBeInTheDocument();
    const providerStatus = screen.getByText('Provider status');
    expect(providerStatus.closest('div')?.querySelector('dd')?.textContent).toBe(
      '2',
    );
    expect(screen.getByText('Last reconciled at')).toBeInTheDocument();
    expect(screen.queryByText(/ignored/i)).not.toBeInTheDocument();
  });

  it('handles missing optional refund fields without inventing values', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockJson(
          detailResponse({
            appointments: [
              appointment({
                refunds: [
                  {
                    id: 'rf2',
                    paymentId: 'pay1',
                    appointmentId: 'a1',
                    payherePaymentId: 'PH-PAY-2',
                    payhereRefundNumber: null,
                    amount: '2500.00',
                    currency: 'LKR',
                    status: 'PENDING',
                    reason: 'NO_SHOW',
                    retrySafe: true,
                    failureMessage: null,
                    providerStatus: null,
                    sanitizedResponse: null,
                    initiatedAt: '2026-03-04T11:00:00.000Z',
                    lastReconciledAt: null,
                    completedAt: null,
                    createdAt: '2026-03-04T11:00:00.000Z',
                    updatedAt: '2026-03-04T11:00:00.000Z',
                  },
                ],
              }),
            ],
          }),
        ),
      ),
    );
    render(<ConsultationDetailView id="c1" />);

    expect(await screen.findByText('PayHere refund number')).toBeInTheDocument();
    expect(screen.getByText('Provider status')).toBeInTheDocument();
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThan(2);
  });

  it('handles missing optional data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockJson(
          detailResponse({
            consultation: {
              ...detailResponse().consultation,
              message: null,
              astrologerSummary: null,
              declineReason: null,
              viewedAt: null,
              respondedAt: null,
              completedAt: null,
            },
            appointments: [],
            proposals: [],
            pendingProposal: null,
            acceptedProposal: null,
          }),
        ),
      ),
    );
    render(<ConsultationDetailView id="c1" />);
    expect(await screen.findByText('Overview')).toBeInTheDocument();
    expect(screen.getByText(/No proposals yet/i)).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('shows 404 with back link', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(mockJson({ message: 'Not found' }, 404)),
    );
    render(<ConsultationDetailView id="missing" />);
    expect(await screen.findByText(/consultation not found/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /back to consultations/i }),
    ).toHaveAttribute('href', '/consultations');
  });

  it('retries after load error', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson({ message: 'Server error' }, 500))
      .mockResolvedValueOnce(mockJson(detailResponse()));
    vi.stubGlobal('fetch', fetchMock);

    render(<ConsultationDetailView id="c1" />);
    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByText('Overview')).toBeInTheDocument();
  });
});
