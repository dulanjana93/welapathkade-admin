export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export function extractApiMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') {
    return fallback;
  }

  const record = body as Record<string, unknown>;

  if (typeof record.message === 'string') {
    if (Array.isArray(record.errors) && record.errors.length > 0) {
      return `${record.message}: ${record.errors.join('; ')}`;
    }
    return record.message;
  }

  if (Array.isArray(record.message)) {
    return record.message.map(String).join('; ');
  }

  if (Array.isArray(record.errors)) {
    return record.errors.map(String).join('; ');
  }

  return fallback;
}

export function statusToFriendlyMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Validation failed.';
    case 401:
      return 'Session expired. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'Resource not found.';
    case 409:
      return 'Conflict with existing data.';
    case 500:
    case 502:
    case 503:
      return 'Server error. Try again later.';
    default:
      return 'Something went wrong';
  }
}
