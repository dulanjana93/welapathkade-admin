import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/LoginForm';
import { messages } from '@/lib/i18n/en';

export default function LoginPage() {
  return (
    <div className="login-page">
      <Suspense fallback={<p className="muted">{messages.common.loading}</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
