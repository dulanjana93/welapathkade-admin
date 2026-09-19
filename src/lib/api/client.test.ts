import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

describe('apiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{ id: '1' }]),
      }),
    );

    const data = await apiClient<Array<{ id: string }>>('/admin/astrologers');
    expect(data).toEqual([{ id: '1' }]);
    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/astrologers',
      expect.objectContaining({ method: 'GET', credentials: 'same-origin' }),
    );
  });

  it('throws ApiError with backend message on 400', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () =>
          JSON.stringify({ message: 'rejectionReason is required when rejecting' }),
      }),
    );

    await expect(
      apiClient('/admin/astrologers/1/application', {
        method: 'PATCH',
        body: { action: 'REJECT' },
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: 'rejectionReason is required when rejecting',
    } satisfies Partial<ApiError>);
  });

  it('throws network ApiError when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    );

    await expect(apiClient('/auth/me')).rejects.toMatchObject({
      status: 0,
      message: expect.stringMatching(/network/i),
    });
  });
});
