import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FinanceWithdrawalDetailView } from '@/features/finance/FinanceWithdrawalDetailView';

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

const destination = {
  bankName: 'Commercial Bank',
  accountHolderName: 'Nimal Perera',
  branchName: 'Kandy',
  bankCode: '7056',
  branchCode: '001',
  accountNumberMasked: '••••9012',
};

function pendingDetail() {
  return {
    id: 'w1',
    amount: '5000.00',
    currency: 'LKR',
    status: 'PENDING_REVIEW',
    createdAt: '2026-03-01T10:00:00.000Z',
    userId: 'u-astro-1',
    astrologerName: 'Nimal Perera',
    bankAccountId: 'ba1',
    destination,
    approvedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    paidAt: null,
    transferReference: null,
    actualTransferredAt: null,
    debit: null,
    events: [
      {
        id: 'e1',
        action: 'CREATED',
        actorUserId: 'u-astro-1',
        reason: null,
        createdAt: '2026-03-01T10:00:00.000Z',
      },
    ],
  };
}

function approvedDetail() {
  return {
    ...pendingDetail(),
    status: 'APPROVED',
    approvedAt: '2026-03-02T10:00:00.000Z',
    events: [
      ...pendingDetail().events,
      {
        id: 'e2',
        action: 'APPROVED',
        actorUserId: 'admin-1',
        reason: null,
        createdAt: '2026-03-02T10:00:00.000Z',
      },
    ],
  };
}

describe('FinanceWithdrawalDetailView', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads detail and shows masked account only', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(pendingDetail())));
    render(<FinanceWithdrawalDetailView id="w1" />);

    expect(await screen.findByText('••••9012')).toBeInTheDocument();
    expect(screen.queryByText(/123456789012/)).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/finance/withdrawals/w1',
      expect.any(Object),
    );
  });

  it('labels a customer referral payout with the customer name', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockJson({
          ...pendingDetail(),
          purpose: 'CUSTOMER_REFERRAL',
          userId: 'u-customer-1',
          customerName: 'Kamal Silva',
          beneficiaryName: 'Kamal Silva',
          astrologerName: undefined,
        }),
      ),
    );
    render(<FinanceWithdrawalDetailView id="w1" />);

    expect(await screen.findByText('Kamal Silva')).toBeInTheDocument();
    expect(screen.getByText('Customer', { selector: 'dt' })).toBeInTheDocument();
    expect(screen.queryByText('Astrologer', { selector: 'dt' })).not.toBeInTheDocument();
    expect(screen.getByText('Customer referral payout')).toBeInTheDocument();
  });

  it('retries after detail load error', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson({ message: 'Not found' }, 404))
      .mockResolvedValueOnce(mockJson(pendingDetail()));
    vi.stubGlobal('fetch', fetchMock);

    render(<FinanceWithdrawalDetailView id="w1" />);
    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByText('••••9012')).toBeInTheDocument();
  });

  it('shows approve and reject for pending review, not mark paid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(pendingDetail())));
    render(<FinanceWithdrawalDetailView id="w1" />);
    await screen.findByText('PENDING_REVIEW');

    expect(
      screen.getByRole('button', { name: /^approve$/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^reject$/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^mark paid$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /cancel request/i }),
    ).not.toBeInTheDocument();
  });

  it('requires rejection reason of at least 3 characters', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(pendingDetail())));
    render(<FinanceWithdrawalDetailView id="w1" />);
    await screen.findByText('PENDING_REVIEW');

    await user.click(screen.getByRole('button', { name: /^reject$/i }));
    const confirm = screen.getByRole('button', { name: /confirm reject/i });
    expect(confirm).toBeDisabled();

    await user.type(
      screen.getByPlaceholderText(/min\. 3 characters/i),
      'No',
    );
    expect(confirm).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/min\. 3 characters/i), ' funds');
    expect(confirm).not.toBeDisabled();
  });

  it('shows mark paid only for approved withdrawals', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(approvedDetail())));
    render(<FinanceWithdrawalDetailView id="w1" />);
    expect(
      await screen.findByRole('button', { name: /^mark paid$/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^approve$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^reject$/i }),
    ).not.toBeInTheDocument();
  });

  it('requires transfer reference and transfer time before mark paid confirm', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(approvedDetail())));
    render(<FinanceWithdrawalDetailView id="w1" />);
    await user.click(
      await screen.findByRole('button', { name: /^mark paid$/i }),
    );
    const confirm = screen.getByRole('button', { name: /confirm mark paid/i });
    expect(confirm).toBeDisabled();

    await user.type(screen.getByLabelText(/transfer reference/i), 'REF-2026-001');
    expect(confirm).toBeDisabled();

    const dtInput = document.querySelector(
      'input[type="datetime-local"]',
    ) as HTMLInputElement;
    await user.type(dtInput, '2026-03-03T14:30');
    await waitFor(() => {
      expect(confirm).not.toBeDisabled();
    });
  });

  function closedDetail(status: 'REJECTED' | 'PAID' | 'CANCELLED') {
    return { ...pendingDetail(), status };
  }

  it('shows cancel only for approved requests and requires a reason', async () => {
    const user = userEvent.setup();
    const approved = {
      ...approvedDetail(),
      funds: {
        availableBalance: '0.00',
        reservedAmount: '1000.00',
        shortfallAmount: '1000.00',
      },
    };
    const cancelled = {
      ...closedDetail('CANCELLED'),
      cancellationReason: 'Earning reversal left a shortfall',
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson(approved))
      .mockResolvedValueOnce(mockJson({ id: 'w1', status: 'CANCELLED' }))
      .mockResolvedValueOnce(mockJson(cancelled));
    vi.stubGlobal('fetch', fetchMock);

    render(<FinanceWithdrawalDetailView id="w1" />);
    expect(await screen.findAllByText('Wallet balance')).not.toHaveLength(0);
    expect(screen.getAllByText('Reserved amount').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Detected shortfall').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: /cancel request/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^reject$/i }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel request/i }));
    expect(screen.getAllByText(/0\.00/).length).toBeGreaterThan(0);
    const confirm = screen.getByRole('button', { name: /confirm cancellation/i });
    expect(confirm).toBeDisabled();
    await user.type(
      screen.getByPlaceholderText(/why this cannot be paid/i),
      'No',
    );
    expect(confirm).toBeDisabled();
    await user.type(
      screen.getByPlaceholderText(/why this cannot be paid/i),
      ' funds',
    );
    expect(confirm).not.toBeDisabled();
    await user.click(confirm);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/finance/withdrawals/w1/cancel',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ reason: 'No funds' }),
        }),
      );
    });
    expect(await screen.findByText('CANCELLED')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /cancel request/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^mark paid$/i }),
    ).not.toBeInTheDocument();
  });

  it('hides cancel for rejected and paid requests', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(closedDetail('PAID'))));
    const { unmount } = render(<FinanceWithdrawalDetailView id="w1" />);
    await screen.findByText('PAID');
    expect(
      screen.queryByRole('button', { name: /cancel request/i }),
    ).not.toBeInTheDocument();
    unmount();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(mockJson(closedDetail('REJECTED'))),
    );
    render(<FinanceWithdrawalDetailView id="w1" />);
    await screen.findByText('REJECTED');
    expect(
      screen.queryByRole('button', { name: /cancel request/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^approve$/i }),
    ).not.toBeInTheDocument();
  });
});
