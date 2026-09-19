import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AstrologerDetailView } from '@/features/astrologers/AstrologerDetailView';

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

const detail = {
  id: 'a1',
  displayName: 'Nimal Perera',
  bio: 'Experienced reader',
  experienceYears: 8,
  photo: null,
  city: 'Kandy',
  district: 'Kandy',
  status: 'INACTIVE',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  user: {
    id: 'u1',
    name: 'Nimal',
    phone: '+94771234567',
    role: 'ASTROLOGER',
    status: 'ACTIVE',
    language: 'SI',
    referralCode: 'REF1',
    referredByUserId: 'ref-user',
  },
  application: {
    id: 'app1',
    status: 'PENDING_REVIEW',
    rejectionReason: null,
    submittedAt: '2026-01-02T00:00:00.000Z',
    reviewedAt: null,
  },
  services: [
    {
      id: 'as1',
      serviceId: 's1',
      code: 'HOROSCOPE_READING',
      nameSi: 'කේන්දර බැලීම',
      nameEn: 'Horoscope reading',
      minPrice: '500.00',
      maxPrice: '5000.00',
      price: '1500.00',
      status: 'ACTIVE',
      serviceStatus: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  availability: {
    timezone: 'Asia/Colombo',
    weekly: {
      monday: [{ id: 'w1', startTime: '09:00', endTime: '12:00' }],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
    exceptions: [],
  },
};

describe('AstrologerDetailView', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders backend detail sections', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(detail)));

    render(<AstrologerDetailView id="a1" />);

    expect(await screen.findByText('Nimal Perera')).toBeInTheDocument();
    expect(screen.getByText('+94771234567')).toBeInTheDocument();
    expect(screen.getByText('Horoscope reading')).toBeInTheDocument();
    expect(screen.getByText('09:00 – 12:00')).toBeInTheDocument();
    expect(screen.getByText('ref-user')).toBeInTheDocument();
  });

  it('approves then refreshes from backend', async () => {
    const user = userEvent.setup();
    const approved = {
      ...detail,
      status: 'ACTIVE',
      application: {
        ...detail.application,
        status: 'APPROVED',
        reviewedAt: '2026-01-03T00:00:00.000Z',
      },
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson(detail))
      .mockResolvedValueOnce(
        mockJson({
          applicationStatus: 'APPROVED',
          profileStatus: 'ACTIVE',
          rejectionReason: null,
        }),
      )
      .mockResolvedValueOnce(mockJson(approved));
    vi.stubGlobal('fetch', fetchMock);

    render(<AstrologerDetailView id="a1" />);
    await screen.findByText('Nimal Perera');

    await user.click(screen.getByRole('button', { name: /^approve$/i }));
    await user.click(screen.getByRole('button', { name: /confirm approve/i }));

    expect(await screen.findByText(/application approved/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('APPROVED')).toBeInTheDocument();
      expect(screen.getAllByText('ACTIVE').length).toBeGreaterThan(0);
    });
    expect(fetchMock.mock.calls[1][0]).toBe(
      '/api/admin/astrologers/a1/application',
    );
  });

  it('surfaces backend approval readiness errors', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson(detail))
      .mockResolvedValueOnce(
        mockJson(
          {
            message: 'Cannot approve incomplete onboarding',
            errors: ['weekly availability is required'],
          },
          400,
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(<AstrologerDetailView id="a1" />);
    await screen.findByText('Nimal Perera');
    await user.click(screen.getByRole('button', { name: /^approve$/i }));
    await user.click(screen.getByRole('button', { name: /confirm approve/i }));

    expect(
      await screen.findByText(/cannot approve incomplete onboarding/i),
    ).toBeInTheDocument();
  });

  it('rejects application with reason', async () => {
    const user = userEvent.setup();
    const rejected = {
      ...detail,
      application: {
        ...detail.application,
        status: 'REJECTED',
        rejectionReason: 'Missing credentials',
        reviewedAt: '2026-01-03T00:00:00.000Z',
      },
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson(detail))
      .mockResolvedValueOnce(
        mockJson({
          applicationStatus: 'REJECTED',
          profileStatus: 'INACTIVE',
          rejectionReason: 'Missing credentials',
        }),
      )
      .mockResolvedValueOnce(mockJson(rejected));
    vi.stubGlobal('fetch', fetchMock);

    render(<AstrologerDetailView id="a1" />);
    await screen.findByText('Nimal Perera');
    await user.click(screen.getByRole('button', { name: /^reject$/i }));
    await user.type(screen.getByPlaceholderText(/explain why/i), 'Missing credentials');
    await user.click(screen.getByRole('button', { name: /confirm reject/i }));

    expect(await screen.findByText(/application rejected/i)).toBeInTheDocument();
    expect(fetchMock.mock.calls[1][1]).toEqual(
      expect.objectContaining({
        body: JSON.stringify({
          action: 'REJECT',
          rejectionReason: 'Missing credentials',
        }),
      }),
    );
  });
});
