import * as React from 'react';
import { cn } from '../lib/cn';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'border-subtle text-ink flex h-10 w-full appearance-none rounded-md border bg-white px-3 py-2 pe-8 text-sm',
        'focus:border-brand-secondary focus:ring-brand-secondary/25 focus:outline-none focus:ring-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        // chevron via inline svg background — keeps zero deps
        'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2020%2020%27%20fill%3D%27%236B7280%27%3E%3Cpath%20d%3D%27M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%27/%3E%3C/svg%3E")]',
        'bg-[length:1rem] bg-[right_0.6rem_center] bg-no-repeat',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';
