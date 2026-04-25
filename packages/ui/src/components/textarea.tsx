import * as React from 'react';
import { cn } from '../lib/cn';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'border-subtle text-ink placeholder:text-ink-subtle flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm',
        'focus:border-brand-secondary focus:ring-brand-secondary/25 focus:outline-none focus:ring-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
