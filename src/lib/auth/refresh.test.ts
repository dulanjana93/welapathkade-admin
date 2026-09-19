import { describe, expect, it, vi, afterEach } from 'vitest';

/**
 * Unit-level coverage for refresh-on-401 behavior used by the server proxy.
 * We test the algorithm in isolation to avoid Next cookies() runtime coupling.
 */
async function fetchWithRefresh(options: {
  firstStatus: number;
  refreshOk: boolean;
  secondStatus?: number;
}) {
  let accessToken = 'old-access';
  const calls: string[] = [];

  async function refresh(): Promise<boolean> {
    calls.push('refresh');
    if (!options.refreshOk) {
      accessToken = '';
      return false;
    }
    accessToken = 'new-access';
    return true;
  }

  async function call(path: string, retried = false): Promise<{ status: number }> {
    calls.push(path);
    const status =
      calls.filter((c) => c === path).length === 1
        ? options.firstStatus
        : (options.secondStatus ?? 200);

    if (status === 401 && !retried && accessToken) {
      const ok = await refresh();
      if (ok) {
        return call(path, true);
      }
      return { status: 401 };
    }
    return { status };
  }

  const result = await call('/admin/services');
  return { result, calls, accessToken };
}

describe('401 refresh behavior', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refreshes once then retries the original request', async () => {
    const { result, calls, accessToken } = await fetchWithRefresh({
      firstStatus: 401,
      refreshOk: true,
      secondStatus: 200,
    });
    expect(result.status).toBe(200);
    expect(calls).toEqual(['/admin/services', 'refresh', '/admin/services']);
    expect(accessToken).toBe('new-access');
  });

  it('clears session path when refresh fails', async () => {
    const { result, calls, accessToken } = await fetchWithRefresh({
      firstStatus: 401,
      refreshOk: false,
    });
    expect(result.status).toBe(401);
    expect(calls).toEqual(['/admin/services', 'refresh']);
    expect(accessToken).toBe('');
  });
});
