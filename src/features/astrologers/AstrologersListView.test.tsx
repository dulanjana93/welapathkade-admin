import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AstrologersListView } from '@/features/astrologers/AstrologersListView';

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

const sample = [
  {
    id: 'a1',
    displayName: 'Nimal Perera',
    bio: null,
    experienceYears: 5,
    photo: null,
    city: 'Colombo',
    district: 'Colombo',
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
      referredByUserId: null,
    },
    application: {
      id: 'app1',
      status: 'PENDING_REVIEW',
      rejectionReason: null,
      submittedAt: '2026-01-02T00:00:00.000Z',
      reviewedAt: null,
    },
    services: [],
  },
];

describe('AstrologersListView', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists pending applications from API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(sample)));

    render(<AstrologersListView />);

    expect(await screen.findByText('Nimal Perera')).toBeInTheDocument();
    expect(screen.getByText('+94771234567')).toBeInTheDocument();
    expect(screen.getAllByText('PENDING_REVIEW').length).toBeGreaterThan(0);
    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/astrologers?applicationStatus=PENDING_REVIEW',
      expect.any(Object),
    );
  });

  it('filters pending via select and shows empty state', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson(sample))
      .mockResolvedValueOnce(mockJson([]));
    vi.stubGlobal('fetch', fetchMock);

    render(<AstrologersListView />);
    await screen.findByText('Nimal Perera');

    await user.selectOptions(screen.getByRole('combobox'), 'APPROVED');

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/api/admin/astrologers?applicationStatus=APPROVED',
        expect.any(Object),
      );
    });
    expect(
      await screen.findByText(/no astrologers match/i),
    ).toBeInTheDocument();
  });
});
