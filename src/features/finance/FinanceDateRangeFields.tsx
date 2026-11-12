'use client';

import { messages } from '@/lib/i18n/en';

export type DateRangeDraft = {
  from: string;
  to: string;
};

export function FinanceDateRangeFields({
  value,
  onChange,
}: {
  value: DateRangeDraft;
  onChange: (next: DateRangeDraft) => void;
}) {
  return (
    <>
      <label className="field inline">
        <span>{messages.finance.dateFrom}</span>
        <input
          type="datetime-local"
          value={value.from}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
        />
      </label>
      <label className="field inline">
        <span>{messages.finance.dateTo}</span>
        <input
          type="datetime-local"
          value={value.to}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
        />
      </label>
    </>
  );
}

/** Map datetime-local value to ISO-8601 for the API, or undefined if empty. */
export function dateRangeToQuery(draft: DateRangeDraft): {
  from?: string;
  to?: string;
} {
  const from = draft.from.trim()
    ? new Date(draft.from).toISOString()
    : undefined;
  const to = draft.to.trim() ? new Date(draft.to).toISOString() : undefined;
  return { from, to };
}
