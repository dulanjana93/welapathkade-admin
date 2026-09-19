import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/api/errors';
import { backendFetch } from '@/lib/api/backend';
import { clearTokenCookies, readTokens } from '@/lib/auth/cookies';
import type { AuthUser } from '@/lib/types/api';

export async function GET() {
  try {
    const { accessToken, refreshToken } = await readTokens();
    if (!accessToken && !refreshToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await backendFetch<AuthUser>('/auth/me');

    if (user.role !== 'ADMIN') {
      await clearTokenCookies();
      return NextResponse.json(
        { message: 'This account is not an ADMIN. Access denied.' },
        { status: 403 },
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401 || error.status === 403) {
        await clearTokenCookies();
      }
      return NextResponse.json({ message: error.message }, { status: error.status || 500 });
    }
    return NextResponse.json({ message: 'Network error' }, { status: 502 });
  }
}
