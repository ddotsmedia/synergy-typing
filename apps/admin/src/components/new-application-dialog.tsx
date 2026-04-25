'use client';

import { Plus } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { Select } from '@synergy/ui/select';
import { FieldRow, FormDialog } from './form-dialog';
import { createApplicationAction } from '@/actions/applications';
import type { Customer, Service } from '@synergy/db/types';

export function NewApplicationButton({
  customers,
  services,
}: {
  customers: Customer[];
  services: Service[];
}) {
  return (
    <FormDialog
      trigger={
        <Button size="sm">
          <Plus className="h-4 w-4" /> New application
        </Button>
      }
      title="Create application"
      description="Use when a customer applies in person — the website creates these automatically online."
      action={createApplicationAction}
    >
      <FieldRow label="Customer" htmlFor="customerId">
        <Select id="customerId" name="customerId" required defaultValue="">
          <option value="" disabled>
            Choose a customer
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.email}
            </option>
          ))}
        </Select>
      </FieldRow>
      <FieldRow label="Service" htmlFor="serviceId">
        <Select id="serviceId" name="serviceId" required defaultValue="">
          <option value="" disabled>
            Choose a service
          </option>
          {services
            .filter((s) => s.active)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.titleEn} · {s.authority}
              </option>
            ))}
        </Select>
      </FieldRow>
    </FormDialog>
  );
}
