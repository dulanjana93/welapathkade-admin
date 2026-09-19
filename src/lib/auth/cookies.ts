import { cookies } from 'next/headers';
import {
  ACCESS_COOKIE_MAX_AGE_SEC,
  ACCESS_TOKEN_COOKIE,
  REFRESH_COOKIE_MAX_AGE_SEC,
  REFRESH_TOKEN_COOKIE,
} from './constants';

export function getApiBaseUrl(): string {
  return process.env.API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3010';
}

export async function readTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const jar = await cookies();
  return {
    accessToken: jar.get(ACCESS_TOKEN_COOKIE)?.value ?? null,
    refreshToken: jar.get(REFRESH_TOKEN_COOKIE)?.value ?? null,
  };
}

export async function setTokenCookies(tokens: {
  accessToken: string;
  refreshToken: string;
}): Promise<void> {
  const jar = await cookies();
  const secure = process.env.NODE_ENV === 'production';

  jar.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_COOKIE_MAX_AGE_SEC,
  });

  jar.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_COOKIE_MAX_AGE_SEC,
  });
}

export async function clearTokenCookies(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_TOKEN_COOKIE);
  jar.delete(REFRESH_TOKEN_COOKIE);
}
