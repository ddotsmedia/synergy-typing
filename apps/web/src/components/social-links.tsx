import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Twitter,
  Youtube,
  type LucideIcon,
} from 'lucide-react';
import type { SocialLinks } from '@synergy/db/types';

const ROW: { key: keyof SocialLinks; label: string; icon: LucideIcon }[] = [
  { key: 'facebook', label: 'Facebook', icon: Facebook },
  { key: 'instagram', label: 'Instagram', icon: Instagram },
  { key: 'twitter', label: 'X / Twitter', icon: Twitter },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'youtube', label: 'YouTube', icon: Youtube },
  { key: 'tiktok', label: 'TikTok', icon: Music2 },
  { key: 'snapchat', label: 'Snapchat', icon: Music2 },
  { key: 'whatsappChannel', label: 'WhatsApp channel', icon: MessageCircle },
];

export function SocialIconRow({
  links,
  followLabel = 'Follow us',
}: {
  links: SocialLinks;
  followLabel?: string;
}) {
  const live = ROW.filter((row) => links[row.key]?.length);
  if (live.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className="text-ink-subtle text-[11px] font-semibold uppercase tracking-[0.18em]">
        {followLabel}
      </p>
      <ul className="flex flex-wrap items-center gap-2">
        {live.map(({ key, label, icon: Icon }) => (
          <li key={key}>
            <a
              href={links[key]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="border-subtle text-ink-muted hover:border-brand-secondary hover:text-brand-primary inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-white transition-colors"
            >
              <Icon className="h-4 w-4" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
