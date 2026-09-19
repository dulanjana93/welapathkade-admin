import {
  ApiError,
  extractApiMessage,
  statusToFriendlyMessage,
} from '@/lib/api/errors';

type ClientOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | undefined>;
};

function withQuery(path: string, query?: Record<string, string | undefined>): string {
  if (!query) {
    return path;
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

async function parseJson(response: Response): Promise<unknown> {
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

/**
 * Browser API client. Calls same-origin Next.js route handlers so tokens
 * stay in httpOnly cookies and never touch localStorage / console logs.
 */
export async function apiClient<T>(
  path: string,
  options: ClientOptions = {},
): Promise<T> {
  const method = options.method ?? (options.body ? 'POST' : 'GET');
  const url = withQuery(`/api${path.startsWith('/') ? path : `/${path}`}`, options.query);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers:
        options.body !== undefined
          ? { 'Content-Type': 'application/json', Accept: 'application/json' }
          : { Accept: 'application/json' },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError(0, 'Network error. Check that the API is reachable.');
  }

  const body = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      extractApiMessage(body, statusToFriendlyMessage(response.status)),
      body,
    );
  }

  return body as T;
}
