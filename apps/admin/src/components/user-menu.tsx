'use client';

import { ChevronDown, LogOut, Settings as SettingsIcon, UserCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@synergy/ui/dropdown-menu';
import { Button } from '@synergy/ui/button';

export function UserMenu({ name, role }: { name: string; role: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2">
          <span
            aria-hidden
            className="bg-brand-primary inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
          >
            {initials}
          </span>
          <span className="hidden text-start sm:block">
            <span className="text-ink block text-xs font-semibold">{name}</span>
            <span className="text-muted block text-[10px] uppercase tracking-wider">{role}</span>
          </span>
          <ChevronDown className="text-muted h-4 w-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[14rem]">
        <DropdownMenuItem>
          <UserCircle className="me-2 h-4 w-4" aria-hidden /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <SettingsIcon className="me-2 h-4 w-4" aria-hidden /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-danger focus:text-danger">
          <LogOut className="me-2 h-4 w-4" aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
