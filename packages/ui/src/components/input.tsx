import * as React from 'react';
import { cn } from '../lib/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'border-subtle text-ink placeholder:text-ink-subtle flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm',
        'focus:border-brand-secondary focus:ring-brand-secondary/25 focus:outline-none focus:ring-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
