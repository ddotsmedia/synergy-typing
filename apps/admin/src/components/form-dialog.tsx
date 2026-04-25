'use client';

import { useEffect, useState, useTransition, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@synergy/ui/dialog';
import { Button } from '@synergy/ui/button';

type ActionResult = void | { ok?: true } | { error?: string };

export function FormDialog({
  trigger,
  title,
  description,
  submitLabel = 'Save',
  action,
  children,
  defaultOpen = false,
  destructive = false,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  submitLabel?: string;
  action: (formData: FormData) => Promise<ActionResult>;
  children: ReactNode;
  defaultOpen?: boolean;
  destructive?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) setError(null);
  }, [open]);

  return (
    <>
      <span onClick={() => setOpen(true)} role="button" tabIndex={0} className="contents">
        {trigger}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          <form
            action={(fd) => {
              startTransition(async () => {
                const r = await action(fd);
                if (r && 'error' in r && r.error) {
                  setError(r.error);
                  return;
                }
                setOpen(false);
                setError(null);
              });
            }}
            className="space-y-4"
          >
            {children}
            {error ? <p className="text-danger text-xs font-medium">{error}</p> : null}
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={pending}
                variant={destructive ? 'default' : 'default'}
              >
                {pending ? 'Working…' : submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ConfirmActionForm({
  trigger,
  title,
  description,
  confirmLabel = 'Delete',
  action,
  hiddenFields,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  action: (formData: FormData) => Promise<unknown>;
  hiddenFields: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <>
      <span onClick={() => setOpen(true)} role="button" tabIndex={0} className="contents">
        {trigger}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          <form
            action={(fd) => {
              startTransition(async () => {
                await action(fd);
                setOpen(false);
              });
            }}
          >
            {Object.entries(hiddenFields).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={pending}
                className="bg-danger hover:bg-danger/90"
              >
                {pending ? 'Working…' : confirmLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function FieldRow({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={htmlFor}
        className="text-muted text-xs font-semibold uppercase tracking-wider"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-muted text-[11px]">{hint}</p> : null}
    </div>
  );
}
