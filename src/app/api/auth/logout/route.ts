import { NextResponse } from 'next/server';
import { getApiBaseUrl, clearTokenCookies, readTokens } from '@/lib/auth/cookies';

export async function POST() {
  const { refreshToken } = await readTokens();

  if (refreshToken) {
    try {
      await fetch(`${getApiBaseUrl()}/admin/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
      });
    } catch {
      // Still clear local session even if remote revoke fails.
    }
  }

  await clearTokenCookies();
  return NextResponse.json({ ok: true });
}
