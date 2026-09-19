'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StateBlock } from '@/components/ui/StateBlock';
import { ServiceStatusBadge } from '@/components/ui/StatusBadge';
import { servicesApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/errors';
import { formatMoney } from '@/lib/format';
import { messages } from '@/lib/i18n/en';
import type { AdminService, CreateServiceDto, ServiceStatus } from '@/lib/types/api';

type FormState = {
  code: string;
  nameSi: string;
  nameEn: string;
  descriptionSi: string;
  descriptionEn: string;
  minPrice: string;
  maxPrice: string;
  status: ServiceStatus;
};

const EMPTY_FORM: FormState = {
  code: '',
  nameSi: '',
  nameEn: '',
  descriptionSi: '',
  descriptionEn: '',
  minPrice: '500',
  maxPrice: '5000',
  status: 'ACTIVE',
};

function toDto(form: FormState): CreateServiceDto {
  return {
    code: form.code.trim().toUpperCase(),
    nameSi: form.nameSi.trim(),
    nameEn: form.nameEn.trim(),
    descriptionSi: form.descriptionSi.trim() || undefined,
    descriptionEn: form.descriptionEn.trim() || undefined,
    minPrice: Number(form.minPrice),
    maxPrice: Number(form.maxPrice),
    status: form.status,
  };
}

export function ServicesView() {
  const [rows, setRows] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminService | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<AdminService | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await servicesApi.list();
      setRows(data);
    } catch (err) {
      setRows([]);
      setError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(service: AdminService) {
    setEditing(service);
    setForm({
      code: service.code,
      nameSi: service.nameSi,
      nameEn: service.nameEn,
      descriptionSi: service.descriptionSi ?? '',
      descriptionEn: service.descriptionEn ?? '',
      minPrice: String(Number(service.minPrice)),
      maxPrice: String(Number(service.maxPrice)),
      status: service.status,
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setSuccess(null);
    try {
      const dto = toDto(form);
      if (editing) {
        await servicesApi.update(editing.id, dto);
        setSuccess(messages.services.updateSuccess);
      } else {
        await servicesApi.create(dto);
        setSuccess(messages.services.createSuccess);
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : messages.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  async function onToggleStatus() {
    if (!statusTarget) {
      return;
    }
    setSubmitting(true);
    setSuccess(null);
    try {
      const next: ServiceStatus =
        statusTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await servicesApi.update(statusTarget.id, { status: next });
      setStatusTarget(null);
      setSuccess(messages.services.updateSuccess);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : messages.common.error);
      setStatusTarget(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="stack">
      <div className="toolbar">
        <Button onClick={openCreate}>{messages.services.create}</Button>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          {messages.services.refresh}
        </Button>
      </div>

      {success ? <Alert tone="success">{success}</Alert> : null}

      {loading ? <StateBlock kind="loading" /> : null}
      {!loading && error ? (
        <StateBlock kind="error" message={error} onRetry={() => void load()} />
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <StateBlock kind="empty" message={messages.services.empty} />
      ) : null}

      {!loading && !error && rows.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{messages.services.code}</th>
                <th>{messages.services.nameEn}</th>
                <th>{messages.services.nameSi}</th>
                <th>{messages.services.minPrice}</th>
                <th>{messages.services.maxPrice}</th>
                <th>{messages.services.status}</th>
                <th>{messages.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <code>{row.code}</code>
                  </td>
                  <td>{row.nameEn}</td>
                  <td>{row.nameSi}</td>
                  <td>{formatMoney(row.minPrice)}</td>
                  <td>{formatMoney(row.maxPrice)}</td>
                  <td>
                    <ServiceStatusBadge status={row.status} />
                  </td>
                  <td>
                    <div className="row gap">
                      <Button variant="ghost" onClick={() => openEdit(row)}>
                        {messages.services.edit}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setStatusTarget(row)}
                      >
                        {row.status === 'ACTIVE'
                          ? messages.services.deactivate
                          : messages.services.activate}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <Dialog
        open={formOpen}
        title={editing ? messages.services.edit : messages.services.create}
        onClose={() => (!submitting ? setFormOpen(false) : undefined)}
        footer={
          <>
            <Button
              variant="ghost"
              disabled={submitting}
              onClick={() => setFormOpen(false)}
            >
              {messages.services.cancel}
            </Button>
            <Button
              type="submit"
              form="service-form"
              loading={submitting}
            >
              {submitting ? messages.services.saving : messages.services.save}
            </Button>
          </>
        }
      >
        {formError ? <Alert tone="error">{formError}</Alert> : null}
        <form id="service-form" className="stack" onSubmit={(e) => void onSubmit(e)}>
          <div className="field">
            <label htmlFor="service-code">{messages.services.code}</label>
            <input
              id="service-code"
              required
              pattern="[A-Z0-9_]+"
              minLength={2}
              maxLength={64}
              value={form.code}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }))
              }
              disabled={submitting}
            />
            <span className="help">{messages.services.codeHint}</span>
          </div>
          <div className="field">
            <label htmlFor="service-name-en">{messages.services.nameEn}</label>
            <input
              id="service-name-en"
              required
              maxLength={200}
              value={form.nameEn}
              onChange={(e) => setForm((prev) => ({ ...prev, nameEn: e.target.value }))}
              disabled={submitting}
            />
          </div>
          <div className="field">
            <label htmlFor="service-name-si">{messages.services.nameSi}</label>
            <input
              id="service-name-si"
              required
              maxLength={200}
              value={form.nameSi}
              onChange={(e) => setForm((prev) => ({ ...prev, nameSi: e.target.value }))}
              disabled={submitting}
            />
          </div>
          <div className="field">
            <label htmlFor="service-desc-en">{messages.services.descriptionEn}</label>
            <textarea
              id="service-desc-en"
              maxLength={2000}
              rows={2}
              value={form.descriptionEn}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, descriptionEn: e.target.value }))
              }
              disabled={submitting}
            />
          </div>
          <div className="field">
            <label htmlFor="service-desc-si">{messages.services.descriptionSi}</label>
            <textarea
              id="service-desc-si"
              maxLength={2000}
              rows={2}
              value={form.descriptionSi}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, descriptionSi: e.target.value }))
              }
              disabled={submitting}
            />
          </div>
          <div className="row gap">
            <div className="field grow">
              <label htmlFor="service-min-price">{messages.services.minPrice}</label>
              <input
                id="service-min-price"
                required
                type="number"
                min={0}
                step="0.01"
                value={form.minPrice}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, minPrice: e.target.value }))
                }
                disabled={submitting}
              />
            </div>
            <div className="field grow">
              <label htmlFor="service-max-price">{messages.services.maxPrice}</label>
              <input
                id="service-max-price"
                required
                type="number"
                min={0}
                step="0.01"
                value={form.maxPrice}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, maxPrice: e.target.value }))
                }
                disabled={submitting}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="service-status">{messages.services.status}</label>
            <select
              id="service-status"
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  status: e.target.value as ServiceStatus,
                }))
              }
              disabled={submitting}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={Boolean(statusTarget)}
        title={
          statusTarget?.status === 'ACTIVE'
            ? messages.services.deactivateTitle
            : messages.services.activateTitle
        }
        onClose={() => (!submitting ? setStatusTarget(null) : undefined)}
        footer={
          <>
            <Button
              variant="ghost"
              disabled={submitting}
              onClick={() => setStatusTarget(null)}
            >
              {messages.services.cancel}
            </Button>
            <Button
              variant={statusTarget?.status === 'ACTIVE' ? 'danger' : 'primary'}
              loading={submitting}
              onClick={() => void onToggleStatus()}
            >
              {statusTarget?.status === 'ACTIVE'
                ? messages.services.confirmDeactivate
                : messages.services.confirmActivate}
            </Button>
          </>
        }
      >
        <p>
          {statusTarget?.status === 'ACTIVE'
            ? messages.services.deactivateBody
            : messages.services.activateBody}
        </p>
        {statusTarget ? (
          <p>
            <strong>{statusTarget.nameEn}</strong> ({statusTarget.code})
          </p>
        ) : null}
      </Dialog>
    </div>
  );
}
