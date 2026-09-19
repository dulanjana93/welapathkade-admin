import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/api/errors';
import { backendFetch } from '@/lib/api/backend';
import { clearTokenCookies, setTokenCookies } from '@/lib/auth/cookies';
import type { AuthTokensResponse } from '@/lib/types/api';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!body.email?.trim() || !body.password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 },
      );
    }

    const data = await backendFetch<AuthTokensResponse>('/admin/auth/login', {
      method: 'POST',
      public: true,
      body: {
        email: body.email.trim(),
        password: body.password,
      },
    });

    if (data.user.role !== 'ADMIN') {
      await clearTokenCookies();
      return NextResponse.json(
        { message: 'This account is not an ADMIN. Access denied.' },
        { status: 403 },
      );
    }

    await setTokenCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    // Never return tokens or password material to the browser.
    return NextResponse.json({ user: data.user });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          message: error.message,
          ...(typeof error.body === 'object' && error.body ? error.body : {}),
        },
        { status: error.status || 500 },
      );
    }
    return NextResponse.json({ message: 'Network error' }, { status: 502 });
  }
}
