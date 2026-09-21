import { afterEach, describe, expect, it, vi } from 'vitest';
import { authApi, astrologersApi, servicesApi, usersApi } from '@/lib/api/admin';

function mockJson(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(data),
  };
}

describe('admin API wrappers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('logs in with email and password', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockJson({ user: { role: 'ADMIN' } }));
    vi.stubGlobal('fetch', fetchMock);

    await authApi.login('admin@welapathkade.local', 'SecretPass1');
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

  it('lists astrologers with applicationStatus filter', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockJson([]));
    vi.stubGlobal('fetch', fetchMock);

    await astrologersApi.list('PENDING_REVIEW');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/astrologers?applicationStatus=PENDING_REVIEW',
      expect.any(Object),
    );
  });

  it('loads astrologer detail', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockJson({ id: 'astro-1', displayName: 'Nimal' }));
    vi.stubGlobal('fetch', fetchMock);

    const detail = await astrologersApi.get('astro-1');
    expect(detail.id).toBe('astro-1');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/astrologers/astro-1',
      expect.any(Object),
    );
  });

  it('approves with action APPROVE', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockJson({
        applicationStatus: 'APPROVED',
        profileStatus: 'ACTIVE',
        rejectionReason: null,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await astrologersApi.review('astro-1', { action: 'APPROVE' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/astrologers/astro-1/application',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ action: 'APPROVE' }),
      }),
    );
  });

  it('rejects with reason', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockJson({
        applicationStatus: 'REJECTED',
        profileStatus: 'INACTIVE',
        rejectionReason: 'Incomplete bio',
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await astrologersApi.review('astro-1', {
      action: 'REJECT',
      rejectionReason: 'Incomplete bio',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/astrologers/astro-1/application',
      expect.objectContaining({
        body: JSON.stringify({
          action: 'REJECT',
          rejectionReason: 'Incomplete bio',
        }),
      }),
    );
  });

  it('lists, creates, and updates services', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson([]))
      .mockResolvedValueOnce(
        mockJson({
          id: 'svc-1',
          code: 'HOROSCOPE_READING',
          nameEn: 'Horoscope reading',
          nameSi: 'කේන්දර බැලීම',
          status: 'ACTIVE',
        }),
      )
      .mockResolvedValueOnce(
        mockJson({
          id: 'svc-1',
          code: 'HOROSCOPE_READING',
          status: 'INACTIVE',
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await servicesApi.list();
    await servicesApi.create({
      code: 'HOROSCOPE_READING',
      nameEn: 'Horoscope reading',
      nameSi: 'කේන්දර බැලීම',
      minPrice: 500,
      maxPrice: 5000,
    });
    await servicesApi.update('svc-1', { status: 'INACTIVE' });

    expect(fetchMock.mock.calls[0][0]).toBe('/api/admin/services');
    expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/services');
    expect(fetchMock.mock.calls[1][1]).toEqual(
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock.mock.calls[2][0]).toBe('/api/admin/services/svc-1');
    expect(fetchMock.mock.calls[2][1]).toEqual(
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'INACTIVE' }),
      }),
    );
  });

  it('logout hits auth logout endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockJson({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    await authApi.logout();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('lists and updates users', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson([]))
      .mockResolvedValueOnce(
        mockJson({
          id: 'u1',
          name: 'Nimal',
          role: 'PUBLIC',
          status: 'SUSPENDED',
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await usersApi.list({ role: 'PUBLIC' });
    await usersApi.updateStatus('u1', { status: 'SUSPENDED' });

    expect(fetchMock.mock.calls[0][0]).toBe('/api/admin/users?role=PUBLIC');
    expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/users/u1');
    expect(fetchMock.mock.calls[1][1]).toEqual(
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'SUSPENDED' }),
      }),
    );
  });
});
