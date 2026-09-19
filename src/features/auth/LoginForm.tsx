'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthProvider';
import { authApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/errors';
import { messages } from '@/lib/i18n/en';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await authApi.login(email.trim(), password);
      if (result.user.role !== 'ADMIN') {
        setError(messages.login.notAdmin);
        return;
      }
      setUser(result.user);
      const next = searchParams.get('next') || '/dashboard';
      router.replace(next.startsWith('/') ? next : '/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError(messages.login.invalidCredentials);
        } else {
          setError(err.message);
        }
      } else {
        setError(messages.common.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-card">
      <div className="login-brand">
        <span className="brand-mark lg">W</span>
        <div>
          <h1>{messages.appName}</h1>
          <p className="muted">{messages.login.subtitle}</p>
        </div>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <form className="stack" onSubmit={(e) => void onSubmit(e)}>
        <label className="field" htmlFor="admin-email">
          <span>{messages.login.emailLabel}</span>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            placeholder={messages.login.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
        </label>
        <label className="field" htmlFor="admin-password">
          <span>{messages.login.passwordLabel}</span>
          <div className="password-field">
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              minLength={8}
              placeholder={messages.login.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
            <button
              type="button"
              className="btn btn-ghost password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              disabled={submitting}
            >
              {showPassword
                ? messages.login.hidePassword
                : messages.login.showPassword}
            </button>
          </div>
        </label>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitting ? messages.login.submitting : messages.login.submit}
        </Button>
      </form>
    </div>
  );
}
