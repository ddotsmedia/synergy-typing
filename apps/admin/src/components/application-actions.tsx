'use client';

import { CheckCircle2, MailWarning, MessageSquarePlus, UserPlus, XCircle } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { Select } from '@synergy/ui/select';
import { Textarea } from '@synergy/ui/textarea';
import { FieldRow, FormDialog } from './form-dialog';
import {
  addNoteAction,
  assignApplicationAction,
  requestDocumentsAction,
  setDocumentStatusAction,
  transitionApplicationAction,
} from '@/actions/applications';
import type { Application, ApplicationDocument, Staff, ApplicationStatus } from '@synergy/db/types';

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under review',
  missing_docs: 'Missing docs',
  with_government: 'With government',
  approved: 'Approved',
  rejected: 'Rejected',
  closed: 'Closed',
};

export function AssignButton({ application, staff }: { application: Application; staff: Staff[] }) {
  return (
    <FormDialog
      trigger={
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4" /> Assign
        </Button>
      }
      title="Assign reviewer"
      action={assignApplicationAction}
    >
      <input type="hidden" name="id" value={application.id} />
      <FieldRow label="Reviewer" htmlFor="staffId">
        <Select id="staffId" name="staffId" defaultValue={application.assignedTo ?? ''}>
          <option value="">Unassigned</option>
          {staff.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} · {u.role}
            </option>
          ))}
        </Select>
      </FieldRow>
    </FormDialog>
  );
}

export function AdvanceStateButton({
  application,
  nextStates,
}: {
  application: Application;
  nextStates: ApplicationStatus[];
}) {
  if (nextStates.length === 0) {
    return (
      <Button size="sm" disabled>
        <CheckCircle2 className="h-4 w-4" /> Final state
      </Button>
    );
  }
  return (
    <FormDialog
      trigger={
        <Button size="sm">
          <CheckCircle2 className="h-4 w-4" /> Advance state
        </Button>
      }
      title="Move application forward"
      description={`Currently: ${STATUS_LABEL[application.status]}.`}
      action={transitionApplicationAction}
    >
      <input type="hidden" name="id" value={application.id} />
      <FieldRow label="Next state" htmlFor="status">
        <Select id="status" name="status" defaultValue={nextStates[0]}>
          {nextStates.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </FieldRow>
      <FieldRow label="Note (optional)" htmlFor="note">
        <Textarea id="note" name="note" rows={3} placeholder="e.g. Submitted to ICA, ref #12345" />
      </FieldRow>
    </FormDialog>
  );
}

export function RequestDocumentsButton({ application }: { application: Application }) {
  return (
    <FormDialog
      trigger={
        <Button variant="outline" size="sm">
          <MailWarning className="h-4 w-4" /> Request docs
        </Button>
      }
      title="Request documents from customer"
      description="Sets the application to Missing docs and notifies the customer (notification stub)."
      action={requestDocumentsAction}
    >
      <input type="hidden" name="id" value={application.id} />
      <FieldRow label="Message" htmlFor="message">
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Please re-upload your photo with a white background. The previous file was rejected."
          required
        />
      </FieldRow>
    </FormDialog>
  );
}

export function AddNoteButton({ application }: { application: Application }) {
  return (
    <FormDialog
      trigger={
        <Button variant="outline" size="sm">
          <MessageSquarePlus className="h-4 w-4" /> Add note
        </Button>
      }
      title="Internal note"
      description="Visible to staff only."
      action={addNoteAction}
    >
      <input type="hidden" name="id" value={application.id} />
      <FieldRow label="Note" htmlFor="note">
        <Textarea id="note" name="note" rows={4} required />
      </FieldRow>
    </FormDialog>
  );
}

export function DocumentRowActions({
  applicationId,
  doc,
}: {
  applicationId: string;
  doc: ApplicationDocument;
}) {
  return (
    <div className="flex items-center gap-1">
      <form action={setDocumentStatusAction}>
        <input type="hidden" name="id" value={applicationId} />
        <input type="hidden" name="docName" value={doc.name} />
        <input type="hidden" name="status" value="verified" />
        <Button type="submit" variant="ghost" size="sm" aria-label="Verify document">
          <CheckCircle2 className="text-success h-4 w-4" />
        </Button>
      </form>
      <form action={setDocumentStatusAction}>
        <input type="hidden" name="id" value={applicationId} />
        <input type="hidden" name="docName" value={doc.name} />
        <input type="hidden" name="status" value="rejected" />
        <Button type="submit" variant="ghost" size="sm" aria-label="Reject document">
          <XCircle className="text-danger h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
