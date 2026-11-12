import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FinanceReconcileView } from '@/features/finance/FinanceReconcileView';

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

describe('FinanceReconcileView', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('runs reconcile on button click', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      mockJson({
        complete: true,
        scanned: {
          wallets: 1,
          walletTotal: 1,
          snapshots: 1,
          snapshotTotal: 1,
          recentLedgerEntries: 2,
        },
        issueCount: 0,
        issues: [],
        issuesTruncated: false,
        notes: {
          signConvention: 'available = CREDIT − DEBIT',
          recordedWithoutCreditsIsValid: true,
          noMutationsPerformed: true,
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<FinanceReconcileView />);
    await user.click(screen.getByRole('button', { name: /run reconciliation/i }));

    expect(await screen.findByText(/scan complete/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/finance/reconcile',
      expect.any(Object),
    );
  });

  it('links an unpayable customer payout to its detail', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockJson({
          complete: true,
          scanned: {
            wallets: 1,
            walletTotal: 1,
            snapshots: 0,
            snapshotTotal: 0,
            recentLedgerEntries: 0,
          },
          issueCount: 1,
          issues: [
            {
              code: 'CUSTOMER_PAYOUT_UNPAYABLE',
              message:
                'Approved customer referral payout exceeds remaining eligible earnings. Cancel it to release the reservation. Do not mark it paid.',
              references: {
                withdrawalId: 'payout-1',
                beneficiaryUserId: 'u1',
                beneficiaryName: 'Kamal Silva',
                amount: '1000.00',
                shortfallAmount: '1000.00',
              },
            },
          ],
          issuesTruncated: false,
          notes: {
            signConvention: 'available = CREDIT − DEBIT',
            recordedWithoutCreditsIsValid: true,
            noMutationsPerformed: true,
          },
        }),
      ),
    );

    render(<FinanceReconcileView />);
    await user.click(screen.getByRole('button', { name: /run reconciliation/i }));

    expect(await screen.findByText('CUSTOMER_PAYOUT_UNPAYABLE')).toBeInTheDocument();
    expect(screen.getByText('Kamal Silva')).toBeInTheDocument();
    expect(screen.getAllByText('1000.00').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /view/i })).toHaveAttribute(
      'href',
      '/finance/withdrawals/payout-1',
    );
  });
});
