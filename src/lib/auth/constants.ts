/** Cookie names for admin session tokens (httpOnly, set by Next route handlers). */
export const ACCESS_TOKEN_COOKIE = 'wpk_access';
export const REFRESH_TOKEN_COOKIE = 'wpk_refresh';

export const ACCESS_COOKIE_MAX_AGE_SEC = 60 * 15; // align with typical short-lived JWT
export const REFRESH_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30;
