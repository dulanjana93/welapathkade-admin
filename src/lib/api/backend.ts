import {
  ApiError,
  extractApiMessage,
  statusToFriendlyMessage,
} from '@/lib/api/errors';
import {
  clearTokenCookies,
  getApiBaseUrl,
  readTokens,
  setTokenCookies,
} from '@/lib/auth/cookies';

type BackendFetchOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | undefined>;
  /** Skip Authorization header (public auth endpoints). */
  public?: boolean;
  /** When true, do not attempt refresh-on-401 (used by refresh itself). */
  skipRefresh?: boolean;
};

function buildUrl(path: string, query?: Record<string, string | undefined>): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${normalized}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }
  return url.toString();
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function tryRefreshSession(): Promise<boolean> {
  const { refreshToken } = await readTokens();
  if (!refreshToken) {
    return false;
  }

  const response = await fetch(buildUrl('/admin/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  if (!response.ok) {
    await clearTokenCookies();
    return false;
  }

  const data = (await parseBody(response)) as {
    accessToken?: string;
    refreshToken?: string;
  };

  if (!data.accessToken || !data.refreshToken) {
    await clearTokenCookies();
    return false;
  }

  await setTokenCookies({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  return true;
}

/**
 * Server-side NestJS fetch with Bearer token from httpOnly cookies.
 * On 401, attempts one refresh rotation then retries once.
 */
export async function backendFetch<T>(
  path: string,
  options: BackendFetchOptions = {},
): Promise<T> {
  const method = options.method ?? (options.body ? 'POST' : 'GET');
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (!options.public) {
    const { accessToken } = await readTokens();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  if (response.status === 401 && !options.public && !options.skipRefresh) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return backendFetch<T>(path, { ...options, skipRefresh: true });
    }
  }

  const body = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      extractApiMessage(body, statusToFriendlyMessage(response.status)),
      body,
    );
  }

  return body as T;
}
