import { LogOut } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { signOutAction } from '@/actions/auth';

export function SignOutForm({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  return (
    <form action={signOutAction}>
      <input type="hidden" name="locale" value={locale} />
      <Button type="submit" variant="outline" size="sm">
        <LogOut className="h-4 w-4" />
        {isAr ? 'تسجيل الخروج' : 'Sign out'}
      </Button>
    </form>
  );
}
