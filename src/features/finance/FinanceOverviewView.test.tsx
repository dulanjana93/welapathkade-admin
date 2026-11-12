import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FinanceOverviewView } from '@/features/finance/FinanceOverviewView';

function mockJson(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(data),
  };
}

const overview = {
  dateRange: { from: null, to: null, interval: 'UTC_HALF_OPEN' as const },
  notes: {
    postedDoesNotMeanWithdrawn: true,
    internalReversalIsNotExternalRefund: true,
    platformResidualIsNotUserWallet: true,
  },
  snapshotsByStatus: {
    RECORDED: { count: 0, grossAmount: '0.00' },
    POSTED: { count: 1, grossAmount: '1000.00' },
    REVERSED: { count: 0, grossAmount: '0.00' },
  },
  postedGrossAmount: '1000.00',
  ledgerByCategory: {
    ASTROLOGER_EARNING: {
      creditAmount: '800.00',
      debitAmount: '0.00',
      netAmount: '800.00',
      creditCount: 1,
      debitCount: 0,
    },
    CUSTOMER_REFERRAL: {
      creditAmount: '0.00',
      debitAmount: '0.00',
      netAmount: '0.00',
      creditCount: 0,
      debitCount: 0,
    },
    ASTROLOGER_REFERRAL: {
      creditAmount: '0.00',
      debitAmount: '0.00',
      netAmount: '0.00',
      creditCount: 0,
      debitCount: 0,
    },
    PLATFORM_RESIDUAL: {
      creditAmount: '200.00',
      debitAmount: '0.00',
      netAmount: '200.00',
      creditCount: 1,
      debitCount: 0,
    },
  },
  refundObligations: {
    count: 0,
    grossAmount: '0.00',
    note: 'Obligation only — not proof an external refund was executed',
  },
  manualReview: { count: 0 },
};

describe('FinanceOverviewView', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads overview from admin finance API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(overview)));
    render(<FinanceOverviewView />);
    expect(await screen.findByText('POSTED')).toBeInTheDocument();
    expect(screen.getByText(/internal accounting/i)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/finance/overview',
      expect.any(Object),
    );
  });

  it('shows astrologer, customer, and combined payout totals separately', async () => {
    const bucket = (amount: string, count = 0) => ({ count, amount });
    const empty = {
      PENDING_REVIEW: bucket('0.00'),
      APPROVED: bucket('0.00'),
      REJECTED: bucket('0.00'),
      PAID: bucket('0.00'),
      CANCELLED: bucket('0.00'),
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockJson({
          ...overview,
          notes: {
            ...overview.notes,
            withdrawalsAreAstrologerEarningsOnly: true,
          },
          withdrawals: {
            scope: 'ASTROLOGER_EARNINGS',
            ...empty,
            byStatus: { ...empty, APPROVED: bucket('1000.00', 1) },
            reservedAmount: '1000.00',
            paidAmount: '0.00',
            debitCount: 1,
            debitAmount: '400.00',
            note: 'Astrologer earnings withdrawals only. Customer referral payouts are reported separately and are not included in these totals.',
          },
          customerReferralPayouts: {
            scope: 'CUSTOMER_REFERRAL',
            ...empty,
            byStatus: { ...empty, PENDING_REVIEW: bucket('1500.00', 1) },
            reservedAmount: '1500.00',
            paidAmount: '0.00',
            debitCount: 0,
            debitAmount: '0.00',
            note: 'Customer referral payouts only. Astrologer earnings withdrawals are not included in these totals.',
          },
          payoutsCombined: {
            scope: 'ASTROLOGER_EARNINGS_PLUS_CUSTOMER_REFERRAL',
            ...empty,
            reservedAmount: '2500.00',
            paidAmount: '0.00',
            debitCount: 1,
            debitAmount: '400.00',
            note: 'Sum of the astrologer earnings and customer referral payout figures. It does not replace either purpose total.',
          },
        }),
      ),
    );
    render(<FinanceOverviewView />);

    expect(await screen.findByText('Astrologer withdrawals')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Customer referral payouts' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Combined payout requests' })).toBeInTheDocument();
    expect(screen.getAllByText(/not included in these totals/i).length).toBe(2);
    expect(screen.getByText(/does not replace either purpose total/i)).toBeInTheDocument();
  });
});
