'use client';

import { Button } from '@/components/ui/Button';
import { messages } from '@/lib/i18n/en';

export function PaginationBar({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  disabled,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  disabled?: boolean;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="toolbar pagination-bar">
      <span className="muted">
        {messages.finance.page} {page} {messages.finance.of} {totalPages} ({total}{' '}
        {messages.finance.totalRows})
      </span>
      <label className="field inline">
        <span>{messages.finance.pageSize}</span>
        <select
          value={pageSize}
          disabled={disabled}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <Button
        variant="secondary"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        {messages.finance.prevPage}
      </Button>
      <Button
        variant="secondary"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        {messages.finance.nextPage}
      </Button>
    </div>
  );
}
