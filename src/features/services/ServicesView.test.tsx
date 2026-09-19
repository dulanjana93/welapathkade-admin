import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServicesView } from '@/features/services/ServicesView';

function mockJson(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(data),
  };
}

const existing = [
  {
    id: 'svc-1',
    code: 'HOROSCOPE_READING',
    nameSi: 'කේන්දර බැලීම',
    nameEn: 'Horoscope reading',
    descriptionSi: null,
    descriptionEn: null,
    minPrice: '500.00',
    maxPrice: '5000.00',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('ServicesView', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists services from admin API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJson(existing)));
    render(<ServicesView />);
    expect(await screen.findByText('HOROSCOPE_READING')).toBeInTheDocument();
    expect(screen.getByText('Horoscope reading')).toBeInTheDocument();
  });

  it('creates a service', async () => {
    const user = userEvent.setup();
    const created = {
      ...existing[0],
      id: 'svc-2',
      code: 'PORONDAM_MATCHING',
      nameEn: 'Porondam matching',
      nameSi: 'පොරන්දම් බැලීම',
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson(existing))
      .mockResolvedValueOnce(mockJson(created))
      .mockResolvedValueOnce(mockJson([...existing, created]));
    vi.stubGlobal('fetch', fetchMock);

    render(<ServicesView />);
    await screen.findByText('HOROSCOPE_READING');
    await user.click(screen.getByRole('button', { name: /create service/i }));

    const code = screen.getByLabelText(/^code$/i);
    await user.clear(code);
    await user.type(code, 'PORONDAM_MATCHING');
    await user.type(screen.getByLabelText(/^english name$/i), 'Porondam matching');
    await user.type(screen.getByLabelText(/^sinhala name$/i), 'පොරන්දම් බැලීම');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(await screen.findByText(/service created/i)).toBeInTheDocument();
    expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/services');
    expect(fetchMock.mock.calls[1][1]).toEqual(
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('edits and deactivates a service', async () => {
    const user = userEvent.setup();
    const updated = { ...existing[0], nameEn: 'Horoscope reading (updated)' };
    const inactive = { ...updated, status: 'INACTIVE' };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJson(existing))
      .mockResolvedValueOnce(mockJson(updated))
      .mockResolvedValueOnce(mockJson([updated]))
      .mockResolvedValueOnce(mockJson(inactive))
      .mockResolvedValueOnce(mockJson([inactive]));
    vi.stubGlobal('fetch', fetchMock);

    render(<ServicesView />);
    await screen.findByText('HOROSCOPE_READING');

    await user.click(screen.getByRole('button', { name: /edit service/i }));
    const english = screen.getByLabelText(/^english name$/i);
    await user.clear(english);
    await user.type(english, 'Horoscope reading (updated)');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(fetchMock.mock.calls.some((c) => String(c[0]).includes('svc-1'))).toBe(
        true,
      );
    });

    await user.click(screen.getByRole('button', { name: /deactivate/i }));
    await user.click(screen.getByRole('button', { name: /confirm deactivate/i }));

    await waitFor(() => {
      const patchBodies = fetchMock.mock.calls
        .filter((c) => c[1]?.method === 'PATCH')
        .map((c) => c[1].body);
      expect(patchBodies).toContain(JSON.stringify({ status: 'INACTIVE' }));
    });
  });
});
