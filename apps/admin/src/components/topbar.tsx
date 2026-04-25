import { Bell, Search } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { Input } from '@synergy/ui/input';
import { MobileSidebar } from './mobile-sidebar';
import { UserMenu } from './user-menu';

export function Topbar() {
  return (
    <header className="border-subtle sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b bg-white/85 px-4 backdrop-blur-md md:px-6">
      <MobileSidebar />
      <div className="relative max-w-xl flex-1">
        <Search
          className="text-ink-subtle pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search applications, customers, services…"
          className="border-subtle bg-surface placeholder:text-ink-subtle h-10 rounded-full ps-10 text-sm"
          aria-label="Search admin"
        />
      </div>
      <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
        <Bell className="text-ink-muted h-5 w-5" aria-hidden />
        <span className="bg-warning absolute end-2 top-2 inline-flex h-2 w-2 rounded-full" />
      </Button>
      <UserMenu name="Mariam Al-Hosani" role="Admin" />
    </header>
  );
}
