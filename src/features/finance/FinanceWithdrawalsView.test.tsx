import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FinanceWithdrawalsView } from '@/features/finance/FinanceWithdrawalsView';

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

const listResponse = {
  page: 1,
  pageSize: 20,
  total: 1,
  items: [
    {
      id: 'w1',
      amount: '5000.00',
      currency: 'LKR',
      status: 'PENDING_REVIEW',
      createdAt: '2026-03-01T10:00:00.000Z',
      userId: 'u-astro-1',
      astrologerName: 'Nimal Perera',
      destination,
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null,
      paidAt: null,
      transferReference: null,
      actualTransferredAt: null,
    },
  ],
};

describe('FinanceWithdrawalsView', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads withdrawals from admin finance API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(listResponse)));
    render(<FinanceWithdrawalsView />);

    expect(await screen.findByText('Nimal Perera')).toBeInTheDocument();
    expect(screen.getByText(/Commercial Bank · ••••9012/)).toBeInTheDocument();
    expect(screen.queryByText(/123456789012/)).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/finance/withdrawals?page=1&pageSize=20',
      expect.any(Object),
    );
  });

  it('retries after list error', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson({ message: 'Server error' }, 500))
      .mockResolvedValueOnce(mockJson(listResponse));
    vi.stubGlobal('fetch', fetchMock);

    render(<FinanceWithdrawalsView />);
    expect(await screen.findByText(/server error/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByText('Nimal Perera')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('loads customer referral payouts separately from astrologer withdrawals', async () => {
    const customerList = {
      ...listResponse,
      items: [
        {
          ...listResponse.items[0],
          userId: 'u-customer-1',
          customerName: 'Kamal Silva',
          beneficiaryName: 'Kamal Silva',
          astrologerName: undefined,
        },
      ],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(customerList)));
    render(<FinanceWithdrawalsView purpose="CUSTOMER_REFERRAL" />);

    expect(
      await screen.findByRole('columnheader', { name: 'Customer' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Kamal Silva')).toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', { name: 'Astrologer' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/separate from astrologer withdrawals/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Commercial Bank · ••••9012/)).toBeInTheDocument();
    expect(screen.queryByText(/123456789012/)).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/finance/withdrawals?page=1&pageSize=20&purpose=CUSTOMER_REFERRAL',
      expect.any(Object),
    );
  });

  it('shows masked account limitation copy', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(listResponse)));
    render(<FinanceWithdrawalsView />);
    await screen.findByText('Nimal Perera');
    expect(
      screen.getByText(/only shows the masked snapshot/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/no reveal/i)).toBeInTheDocument();
  });
});
