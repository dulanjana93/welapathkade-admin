'use client';

export function Alert({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'success' | 'error' | 'warning';
  children: React.ReactNode;
}) {
  return <div className={`alert alert-${tone}`}>{children}</div>;
}
