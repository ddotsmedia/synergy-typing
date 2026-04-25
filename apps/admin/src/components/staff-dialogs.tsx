'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { Input } from '@synergy/ui/input';
import { Select } from '@synergy/ui/select';
import { ConfirmActionForm, FieldRow, FormDialog } from './form-dialog';
import { createStaffAction, deleteStaffAction, updateStaffAction } from '@/actions/staff';
import type { Staff, StaffRole } from '@synergy/db/types';

const ROLES: { value: StaffRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'staff', label: 'Staff' },
];

function StaffFields({ user }: { user?: Staff }) {
  return (
    <>
      <FieldRow label="Name" htmlFor="name">
        <Input id="name" name="name" defaultValue={user?.name} required />
      </FieldRow>
      <FieldRow label="Email" htmlFor="email">
        <Input id="email" type="email" name="email" defaultValue={user?.email} required />
      </FieldRow>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Role" htmlFor="role">
          <Select id="role" name="role" defaultValue={user?.role ?? 'staff'}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </FieldRow>
        <FieldRow label="Branch" htmlFor="branch">
          <Input id="branch" name="branch" defaultValue={user?.branch ?? 'Musaffah HQ'} />
        </FieldRow>
      </div>
    </>
  );
}

export function InviteStaffButton() {
  return (
    <FormDialog
      trigger={
        <Button size="sm">
          <Plus className="h-4 w-4" /> Invite teammate
        </Button>
      }
      title="Invite teammate"
      description="They'll get a magic-link sign-in once Auth.js is wired (later step)."
      action={createStaffAction}
    >
      <StaffFields />
    </FormDialog>
  );
}

export function EditStaffButton({ user }: { user: Staff }) {
  return (
    <FormDialog
      trigger={
        <Button variant="ghost" size="sm" aria-label="Edit staff member">
          <Pencil className="h-4 w-4" />
        </Button>
      }
      title={`Edit ${user.name}`}
      action={updateStaffAction}
    >
      <input type="hidden" name="id" value={user.id} />
      <StaffFields user={user} />
    </FormDialog>
  );
}

export function DeleteStaffButton({ user }: { user: Staff }) {
  return (
    <ConfirmActionForm
      trigger={
        <Button variant="ghost" size="sm" aria-label="Remove staff member">
          <Trash2 className="text-danger h-4 w-4" />
        </Button>
      }
      title={`Remove ${user.name}?`}
      description="Open applications assigned to this person become unassigned."
      action={deleteStaffAction}
      hiddenFields={{ id: user.id }}
      confirmLabel="Remove"
    />
  );
}
