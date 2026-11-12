'use client';

export function RefId({ value }: { value: string | null | undefined }) {
  if (!value) {
    return <span className="muted">—</span>;
  }
  const short =
    value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
  return (
    <code className="tiny" title={value}>
      {short}
    </code>
  );
}
