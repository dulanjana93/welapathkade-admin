import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from '@/features/auth/LoginForm';
import { AuthProvider } from '@/features/auth/AuthProvider';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/login',
}));

function mockJson(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(data),
  };
}

describe('LoginForm', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    replace.mockReset();
    vi.unstubAllGlobals();
  });

  it('shows email/password fields and no OTP UI', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(mockJson({ message: 'Unauthorized' }, 401)),
    );

    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>,
    );

    expect(await screen.findByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByText(/otp/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/phone/i)).not.toBeInTheDocument();
  });

  it('completes admin email/password login', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson({ message: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(
        mockJson({
          user: {
            id: 'admin-1',
            name: 'Admin',
            phone: 'admin:admin@welapathkade.local',
            email: 'admin@welapathkade.local',
            role: 'ADMIN',
            status: 'ACTIVE',
            language: 'EN',
            referralCode: 'ADM001',
            referredByUserId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>,
    );

    await user.type(
      screen.getByLabelText(/^email$/i),
      'admin@welapathkade.local',
    );
    await user.type(screen.getByLabelText(/^password$/i), 'SecretPass1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/dashboard');
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@welapathkade.local',
          password: 'SecretPass1',
        }),
      }),
    );
  });

  it('shows invalid credentials on 401', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson({ message: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(
        mockJson({ message: 'Invalid email or password' }, 401),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>,
    );

    await user.type(screen.getByLabelText(/^email$/i), 'admin@welapathkade.local');
    await user.type(screen.getByLabelText(/^password$/i), 'WrongPass1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText(/invalid email or password/i),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('rejects non-admin accounts', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson({ message: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(
        mockJson({ message: 'This account is not an ADMIN. Access denied.' }, 403),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>,
    );

    await user.type(screen.getByLabelText(/^email$/i), 'public@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'SecretPass1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/not an admin/i)).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
