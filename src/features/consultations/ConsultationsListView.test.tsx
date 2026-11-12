import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsultationsListView } from '@/features/consultations/ConsultationsListView';

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

const listItem = {
  id: 'c1',
  status: 'ACCEPTED',
  submittedAt: '2026-03-01T10:00:00.000Z',
  expiresAt: '2026-03-02T10:00:00.000Z',
  respondedAt: '2026-03-01T11:00:00.000Z',
  completedAt: null,
  requestedPrice: '2500.00',
  currency: 'LKR',
  serviceNameEn: 'Birth chart',
  serviceNameSi: 'ජන්ම පත්‍රය',
  customer: {
    id: 'u-customer-1',
    name: 'Amal Perera',
    phone: '+94771110001',
  },
  astrologer: {
    id: 'ap1',
    displayName: 'Nimal Astro',
    userId: 'u-astro-1',
  },
  proposal: {
    pendingProposal: null,
    acceptedProposal: {
      id: 'p1',
      status: 'ACCEPTED',
      proposedStartAt: '2026-03-05T10:00:00.000Z',
      durationMinutes: 30,
    },
    totalCount: 1,
  },
  latestAppointment: {
    id: 'a1',
    status: 'CONFIRMED',
    startAt: '2026-03-05T10:00:00.000Z',
    reservationExpiresAt: '2026-03-04T10:00:00.000Z',
    amount: '2500.00',
    currency: 'LKR',
    refundObligation: 'FULL_REFUND_DUE',
    manualReviewRequired: true,
    payment: {
      id: 'pay1',
      status: 'PAID',
      amount: '2500.00',
      currency: 'LKR',
      paidAt: '2026-03-03T10:00:00.000Z',
      provider: 'PAYHERE',
    },
  },
  flags: {
    hasRefundObligation: true,
    manualReviewRequired: true,
    hasSnapshot: false,
  },
};

const listResponse = {
  page: 1,
  pageSize: 20,
  total: 1,
  notes: {
    appointmentFiltersMatchAnyRelatedAppointment: true,
    listShowsLatestAppointmentByCreatedAt: true,
    readOnly: true,
  },
  items: [listItem],
};

describe('ConsultationsListView', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows loading then rows with latest appointment/payment and links', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(listResponse)));
    render(<ConsultationsListView />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(await screen.findByText('Amal Perera')).toBeInTheDocument();
    expect(screen.getByText('Nimal Astro')).toBeInTheDocument();
    expect(screen.getByText('Birth chart')).toBeInTheDocument();
    const badges = Array.from(document.querySelectorAll('.badge')).map(
      (el) => el.textContent,
    );
    expect(badges).toEqual(
      expect.arrayContaining(['ACCEPTED', 'CONFIRMED', 'PAID']),
    );
    expect(screen.getByText(/Refund due · Manual review/)).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Amal Perera' })).toHaveAttribute(
      'href',
      '/users/u-customer-1',
    );
    expect(screen.getByRole('link', { name: 'Nimal Astro' })).toHaveAttribute(
      'href',
      '/astrologers/ap1',
    );
    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute(
      'href',
      '/consultations/c1',
    );
    expect(
      screen.getByText(/Flags and appointment\/payment columns always describe the latest appointment only/i),
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/consultations?page=1&pageSize=20',
      expect.any(Object),
    );
  });

  it('shows submitted date filter labels and half-open UTC helper text', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(listResponse)));
    render(<ConsultationsListView />);
    await screen.findByText('Amal Perera');

    expect(screen.getByLabelText(/Submitted from/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Submitted to/i)).toBeInTheDocument();
    expect(
      screen.getByText(/UTC half-open interval \[from, to\)/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/end bound is exclusive/i),
    ).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockJson({ ...listResponse, total: 0, items: [] }),
      ),
    );
    render(<ConsultationsListView />);
    expect(
      await screen.findByText(/no consultations match/i),
    ).toBeInTheDocument();
  });

  it('retries after list error', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson({ message: 'Server error' }, 500))
      .mockResolvedValueOnce(mockJson(listResponse));
    vi.stubGlobal('fetch', fetchMock);

    render(<ConsultationsListView />);
    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByText('Amal Perera')).toBeInTheDocument();
  });

  it('applies and clears draft filters, resetting page', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(mockJson(listResponse));
    vi.stubGlobal('fetch', fetchMock);

    render(<ConsultationsListView />);
    await screen.findByText('Amal Perera');

    await user.type(
      screen.getByPlaceholderText(/ID, phone, customer or astrologer name/i),
      'Amal',
    );
    const statusSelect = screen.getByLabelText(/Consultation status/i);
    await user.selectOptions(statusSelect, 'PENDING');
    const refundSelect = screen.getByLabelText(/^Refund obligation$/i);
    await user.selectOptions(refundSelect, 'YES');
    const reviewSelect = screen.getByLabelText(/^Manual review$/i);
    await user.selectOptions(reviewSelect, 'NO');

    await user.click(screen.getByRole('button', { name: /apply filters/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        expect.stringContaining('status=PENDING'),
        expect.any(Object),
      );
    });
    expect(fetchMock.mock.calls.at(-1)?.[0]).toContain('q=Amal');
    expect(fetchMock.mock.calls.at(-1)?.[0]).toContain(
      'hasRefundObligation=true',
    );
    expect(fetchMock.mock.calls.at(-1)?.[0]).toContain(
      'manualReviewRequired=false',
    );
    expect(fetchMock.mock.calls.at(-1)?.[0]).toContain('page=1');

    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/api/admin/consultations?page=1&pageSize=20',
        expect.any(Object),
      );
    });
  });

  it('paginates with page size change', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      mockJson({ ...listResponse, total: 40 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<ConsultationsListView />);
    await screen.findByText('Amal Perera');

    const pageSize = within(document.body).getByDisplayValue('20');
    await user.selectOptions(pageSize, '50');

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/api/admin/consultations?page=1&pageSize=50',
        expect.any(Object),
      );
    });
  });

  it('shows dash when latest appointment is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockJson({
          ...listResponse,
          items: [
            {
              ...listItem,
              latestAppointment: null,
              flags: {
                hasRefundObligation: false,
                manualReviewRequired: false,
                hasSnapshot: false,
              },
            },
          ],
        }),
      ),
    );
    render(<ConsultationsListView />);
    await screen.findByText('Amal Perera');
    expect(document.querySelectorAll('.badge').length).toBe(1);
    expect(screen.queryByText(/Refund due/)).not.toBeInTheDocument();
  });
});
