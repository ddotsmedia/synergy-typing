import Image from 'next/image';
import Link from 'next/link';

export function AdminLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/" aria-label="Synergy Admin — home" className="inline-flex items-center gap-2.5">
      <Image
        src="/brand/logo-mark.png"
        alt=""
        width={64}
        height={64}
        priority
        className="h-9 w-9 shrink-0"
      />
      {!collapsed ? (
        <span className="leading-tight">
          <span className="text-brand-primary block text-[15px] font-bold tracking-tight">
            Synergy
          </span>
          <span className="text-ink-subtle block text-[10px] font-medium uppercase tracking-[0.18em]">
            Admin console
          </span>
        </span>
      ) : null}
    </Link>
  );
}
