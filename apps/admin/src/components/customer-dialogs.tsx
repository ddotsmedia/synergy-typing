'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { Input } from '@synergy/ui/input';
import { ConfirmActionForm, FieldRow, FormDialog } from './form-dialog';
import {
  createCustomerAction,
  deleteCustomerAction,
  updateCustomerAction,
} from '@/actions/customers';
import type { Customer } from '@synergy/db/types';

function CustomerFields({ customer }: { customer?: Customer }) {
  return (
    <>
      <FieldRow label="Name" htmlFor="name">
        <Input id="name" name="name" defaultValue={customer?.name} required />
      </FieldRow>
      <FieldRow label="Email" htmlFor="email">
        <Input id="email" type="email" name="email" defaultValue={customer?.email} required />
      </FieldRow>
      <FieldRow label="Phone" htmlFor="phone">
        <Input id="phone" name="phone" defaultValue={customer?.phone} placeholder="+971 …" />
      </FieldRow>
      <FieldRow
        label="Emirates ID"
        htmlFor="emiratesId"
        hint="Stored masked in the UI; full value never logged."
      >
        <Input
          id="emiratesId"
          name="emiratesId"
          defaultValue={customer?.emiratesId}
          placeholder="784-YYYY-XXXXXXX-X"
        />
      </FieldRow>
    </>
  );
}

export function NewCustomerButton() {
  return (
    <FormDialog
      trigger={
        <Button size="sm">
          <Plus className="h-4 w-4" /> Add customer
        </Button>
      }
      title="Add customer"
      description="Manually create a customer record. Most customers self-register on the website."
      action={createCustomerAction}
    >
      <CustomerFields />
    </FormDialog>
  );
}

export function EditCustomerButton({ customer }: { customer: Customer }) {
  return (
    <FormDialog
      trigger={
        <Button variant="ghost" size="sm" aria-label="Edit customer">
          <Pencil className="h-4 w-4" />
        </Button>
      }
      title={`Edit ${customer.name}`}
      action={updateCustomerAction}
    >
      <input type="hidden" name="id" value={customer.id} />
      <CustomerFields customer={customer} />
    </FormDialog>
  );
}

export function DeleteCustomerButton({ customer }: { customer: Customer }) {
  return (
    <ConfirmActionForm
      trigger={
        <Button variant="ghost" size="sm" aria-label="Delete customer">
          <Trash2 className="text-danger h-4 w-4" />
        </Button>
      }
      title={`Delete ${customer.name}?`}
      description="This removes the customer record. Their applications stay in the audit log."
      action={deleteCustomerAction}
      hiddenFields={{ id: customer.id }}
    />
  );
}
