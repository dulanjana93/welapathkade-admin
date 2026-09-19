import { describe, expect, it } from 'vitest';
import {
  ApiError,
  extractApiMessage,
  statusToFriendlyMessage,
} from '@/lib/api/errors';

describe('API error handling', () => {
  it('maps HTTP statuses to admin-friendly messages', () => {
    expect(statusToFriendlyMessage(401)).toMatch(/session expired/i);
    expect(statusToFriendlyMessage(403)).toMatch(/permission/i);
    expect(statusToFriendlyMessage(404)).toMatch(/not found/i);
    expect(statusToFriendlyMessage(409)).toMatch(/conflict/i);
    expect(statusToFriendlyMessage(500)).toMatch(/server error/i);
  });

  it('extracts NestJS message + readiness errors', () => {
    const message = extractApiMessage(
      {
        message: 'Cannot approve incomplete onboarding',
        errors: ['weekly availability is required', 'city is required'],
      },
      'fallback',
    );
    expect(message).toContain('Cannot approve incomplete onboarding');
    expect(message).toContain('weekly availability is required');
  });

  it('creates typed ApiError', () => {
    const err = new ApiError(400, 'bad', { message: 'bad' });
    expect(err.status).toBe(400);
    expect(err.message).toBe('bad');
  });
});
