import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersListView } from '@/features/users/UsersListView';

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
    id: 'u1',
    name: 'Nimal',
    phone: '+94771234567',
    email: null,
    role: 'PUBLIC',
    status: 'ACTIVE',
    language: 'SI',
    referralCode: 'REF1',
    referredByUserId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    astrologerProfileId: null,
    profileStatus: null,
    applicationStatus: null,
  },
];

describe('UsersListView', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists users from admin API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(sample)));
    render(<UsersListView />);
    expect(await screen.findByText('Nimal')).toBeInTheDocument();
    expect(screen.getByText('+94771234567')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/admin/users', expect.any(Object));
  });

  it('filters by role via API', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson(sample))
      .mockResolvedValueOnce(mockJson([]));
    vi.stubGlobal('fetch', fetchMock);

    render(<UsersListView />);
    await screen.findByText('Nimal');
    await user.selectOptions(screen.getAllByRole('combobox')[0], 'ASTROLOGER');

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/api/admin/users?role=ASTROLOGER',
        expect.any(Object),
      );
    });
    expect(await screen.findByText(/no users match/i)).toBeInTheDocument();
  });
});
