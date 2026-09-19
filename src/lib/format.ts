export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-LK', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Colombo',
  }).format(date);
}

export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) {
    return String(value);
  }
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 2,
  }).format(num);
}
