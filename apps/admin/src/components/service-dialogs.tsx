'use client';

import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { Input } from '@synergy/ui/input';
import { Select } from '@synergy/ui/select';
import { ConfirmActionForm, FieldRow, FormDialog } from './form-dialog';
import {
  createServiceAction,
  deleteServiceAction,
  toggleServiceActiveAction,
  toggleServiceFeesVisibleAction,
  updateFeesOnlyAction,
  updateServiceAction,
} from '@/actions/services';
import type { Service, ServiceCategory } from '@synergy/db/types';

const CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'immigration', label: 'Immigration' },
  { value: 'labour', label: 'Labour' },
  { value: 'company', label: 'Company' },
  { value: 'transport', label: 'Transport' },
  { value: 'realEstate', label: 'Real estate' },
  { value: 'attestation', label: 'Attestation' },
  { value: 'medical', label: 'Medical' },
  { value: 'other', label: 'Other' },
];

function ServiceFields({ service }: { service?: Service }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Title (EN)" htmlFor="titleEn">
          <Input id="titleEn" name="titleEn" defaultValue={service?.titleEn} required />
        </FieldRow>
        <FieldRow label="Title (AR)" htmlFor="titleAr">
          <Input id="titleAr" name="titleAr" defaultValue={service?.titleAr} required dir="rtl" />
        </FieldRow>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Slug" htmlFor="slug" hint="Auto-generated if blank.">
          <Input id="slug" name="slug" defaultValue={service?.slug} />
        </FieldRow>
        <FieldRow label="Authority" htmlFor="authority">
          <Input
            id="authority"
            name="authority"
            defaultValue={service?.authority}
            placeholder="MOHRE, ICA, …"
          />
        </FieldRow>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Category" htmlFor="category">
          <Select id="category" name="category" defaultValue={service?.category ?? 'other'}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </FieldRow>
        <FieldRow label="Processing days" htmlFor="processingDays">
          <Input
            id="processingDays"
            name="processingDays"
            type="number"
            min={1}
            defaultValue={service?.processingDays ?? 1}
          />
        </FieldRow>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Government fee (AED)" htmlFor="govFee">
          <Input
            id="govFee"
            name="govFee"
            type="number"
            min={0}
            defaultValue={service?.govFee ?? 0}
          />
        </FieldRow>
        <FieldRow label="Service fee (AED)" htmlFor="serviceFee">
          <Input
            id="serviceFee"
            name="serviceFee"
            type="number"
            min={0}
            defaultValue={service?.serviceFee ?? 0}
          />
        </FieldRow>
      </div>
      <label className="border-subtle bg-surface flex items-start gap-3 rounded-lg border p-3">
        <input
          type="checkbox"
          name="feesVisible"
          defaultChecked={service?.feesVisible ?? true}
          className="border-default text-brand-primary focus:ring-brand-secondary/30 mt-0.5 h-4 w-4 rounded"
        />
        <span className="flex-1 space-y-0.5">
          <span className="text-ink block text-sm font-medium">Show fees on the customer site</span>
          <span className="text-ink-subtle block text-xs">
            When off, the public catalogue, fee calculator and apply page show "On request" instead.
            Applications are still accepted; the actual fees are snapshotted for invoicing.
          </span>
        </span>
      </label>
    </>
  );
}

export function NewServiceButton() {
  return (
    <FormDialog
      trigger={
        <Button size="sm">
          <Plus className="h-4 w-4" /> Add service
        </Button>
      }
      title="Add service"
      description="New entries appear in the customer catalogue once active."
      action={createServiceAction}
    >
      <ServiceFields />
    </FormDialog>
  );
}

export function EditServiceButton({ service }: { service: Service }) {
  return (
    <FormDialog
      trigger={
        <Button variant="ghost" size="sm" aria-label="Edit service">
          <Pencil className="h-4 w-4" />
        </Button>
      }
      title={`Edit ${service.titleEn}`}
      action={updateServiceAction}
    >
      <input type="hidden" name="id" value={service.id} />
      <ServiceFields service={service} />
    </FormDialog>
  );
}

export function EditFeesButton({ service }: { service: Service }) {
  return (
    <FormDialog
      trigger={
        <Button variant="ghost" size="sm" aria-label="Edit fees">
          <Pencil className="h-4 w-4" />
        </Button>
      }
      title={`Fees · ${service.titleEn}`}
      description="VAT (5%) and total recompute automatically."
      action={updateFeesOnlyAction}
    >
      <input type="hidden" name="id" value={service.id} />
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Government fee (AED)" htmlFor="govFee">
          <Input id="govFee" name="govFee" type="number" min={0} defaultValue={service.govFee} />
        </FieldRow>
        <FieldRow label="Service fee (AED)" htmlFor="serviceFee">
          <Input
            id="serviceFee"
            name="serviceFee"
            type="number"
            min={0}
            defaultValue={service.serviceFee}
          />
        </FieldRow>
      </div>
    </FormDialog>
  );
}

export function ToggleServiceActiveForm({ service }: { service: Service }) {
  return (
    <form action={toggleServiceActiveAction}>
      <input type="hidden" name="id" value={service.id} />
      <button
        type="submit"
        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
          service.active
            ? 'bg-success-soft text-success hover:bg-success/15'
            : 'bg-surface-muted text-ink-subtle hover:bg-surface'
        }`}
      >
        {service.active ? 'Active' : 'Hidden'}
      </button>
    </form>
  );
}

export function ToggleFeesVisibleForm({ service }: { service: Service }) {
  return (
    <form action={toggleServiceFeesVisibleAction}>
      <input type="hidden" name="id" value={service.id} />
      <button
        type="submit"
        title={
          service.feesVisible
            ? 'Fees are visible on the customer site — click to hide.'
            : 'Fees are hidden from the customer site — click to show.'
        }
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
          service.feesVisible
            ? 'bg-brand-secondary-soft text-brand-primary hover:bg-brand-secondary/20'
            : 'bg-warning-soft text-warning hover:bg-warning/20'
        }`}
      >
        {service.feesVisible ? (
          <>
            <Eye className="h-3 w-3" aria-hidden /> Public
          </>
        ) : (
          <>
            <EyeOff className="h-3 w-3" aria-hidden /> On request
          </>
        )}
      </button>
    </form>
  );
}

export function DeleteServiceButton({ service }: { service: Service }) {
  return (
    <ConfirmActionForm
      trigger={
        <Button variant="ghost" size="sm" aria-label="Delete service">
          <Trash2 className="text-danger h-4 w-4" />
        </Button>
      }
      title={`Delete ${service.titleEn}?`}
      description="The service stops appearing in the catalogue. Existing applications keep their reference."
      action={deleteServiceAction}
      hiddenFields={{ id: service.id }}
    />
  );
}
