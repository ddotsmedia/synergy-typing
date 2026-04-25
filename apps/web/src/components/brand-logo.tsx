import Image from 'next/image';
import { Link } from '@/i18n/routing';

export function BrandLogoLockup({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Synergy Typing Services — home"
      className={`group inline-flex items-center ${className ?? ''}`}
    >
      <Image
        src="/brand/logo-lockup.png"
        alt="Synergy Typing Services"
        width={2000}
        height={1000}
        priority
        className="hidden h-9 w-auto md:block"
      />
      <span className="flex items-center gap-2 md:hidden">
        <Image
          src="/brand/logo-mark.png"
          alt=""
          width={400}
          height={400}
          priority
          className="h-8 w-8"
        />
        <span className="text-brand-primary font-semibold">Synergy Typing</span>
      </span>
    </Link>
  );
}

export function BrandLogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/brand/logo-mark.png"
      alt="Synergy Typing"
      width={size * 2}
      height={size * 2}
      className={className ?? ''}
      style={{ width: size, height: size }}
    />
  );
}
