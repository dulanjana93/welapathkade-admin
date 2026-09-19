'use client';

import { Button } from '@/components/ui/Button';
import { messages } from '@/lib/i18n/en';

export function StateBlock({
  kind,
  message,
  onRetry,
}: {
  kind: 'loading' | 'empty' | 'error';
  message?: string;
  onRetry?: () => void;
}) {
  if (kind === 'loading') {
    return <div className="state-block muted">{messages.common.loading}</div>;
  }
  if (kind === 'empty') {
    return <div className="state-block muted">{message ?? 'Nothing here yet.'}</div>;
  }
  return (
    <div className="state-block error">
      <p>{message ?? messages.common.error}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          {messages.common.retry}
        </Button>
      ) : null}
    </div>
  );
}
