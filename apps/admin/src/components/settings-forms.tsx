'use client';

import { useTransition } from 'react';
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
import { Button } from '@synergy/ui/button';
import { Input } from '@synergy/ui/input';
import { Select } from '@synergy/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@synergy/ui/card';
import { Badge } from '@synergy/ui/badge';
import { ConfirmActionForm, FieldRow } from './form-dialog';
import {
  resetToSeedAction,
  setIntegrationStatusAction,
  updateSettingsAction,
  updateSocialLinksAction,
} from '@/actions/settings';
import type { Integration, Settings, SocialPlatform } from '@synergy/db/types';

const SOCIAL_FIELDS: {
  key: SocialPlatform;
  label: string;
  icon: LucideIcon;
  placeholder: string;
}[] = [
  {
    key: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    placeholder: 'https://facebook.com/synergytyping',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: Instagram,
    placeholder: 'https://instagram.com/synergytyping',
  },
  {
    key: 'twitter',
    label: 'X / Twitter',
    icon: Twitter,
    placeholder: 'https://x.com/synergytyping',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    placeholder: 'https://linkedin.com/company/synergytyping',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: Youtube,
    placeholder: 'https://youtube.com/@synergytyping',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    icon: Music2,
    placeholder: 'https://tiktok.com/@synergytyping',
  },
  {
    key: 'snapchat',
    label: 'Snapchat',
    icon: Music2,
    placeholder: 'https://snapchat.com/add/synergytyping',
  },
  {
    key: 'whatsappChannel',
    label: 'WhatsApp channel',
    icon: MessageCircle,
    placeholder: 'https://whatsapp.com/channel/…',
  },
];

const STATUS_OPTIONS: { value: Integration['status']; label: string }[] = [
  { value: 'connected', label: 'Connected' },
  { value: 'sandbox', label: 'Sandbox' },
  { value: 'not_connected', label: 'Not connected' },
  { value: 'planned', label: 'Planned (Phase 2)' },
];

const STATUS_VARIANT: Record<Integration['status'], 'success' | 'warning' | 'muted' | 'secondary'> =
  {
    connected: 'success',
    sandbox: 'warning',
    not_connected: 'muted',
    planned: 'secondary',
  };

export function BranchForm({ settings }: { settings: Settings }) {
  const [pending, startTransition] = useTransition();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Branch information</CardTitle>
        <CardDescription>Surfaced in the customer footer and on invoices.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={(fd) =>
            startTransition(async () => {
              await updateSettingsAction(fd);
            })
          }
          className="grid gap-4 md:grid-cols-2"
        >
          <FieldRow label="Trade name" htmlFor="tradeName">
            <Input id="tradeName" name="tradeName" defaultValue={settings.tradeName} />
          </FieldRow>
          <FieldRow label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" defaultValue={settings.phone} />
          </FieldRow>
          <FieldRow label="WhatsApp" htmlFor="whatsapp">
            <Input id="whatsapp" name="whatsapp" defaultValue={settings.whatsapp} />
          </FieldRow>
          <FieldRow label="Email" htmlFor="email">
            <Input id="email" type="email" name="email" defaultValue={settings.email} />
          </FieldRow>
          <div className="md:col-span-2">
            <FieldRow label="Address" htmlFor="address">
              <Input id="address" name="address" defaultValue={settings.address} />
            </FieldRow>
          </div>
          <FieldRow label="Licence number" htmlFor="licence">
            <Input
              id="licence"
              name="licence"
              defaultValue={settings.licence}
              placeholder="TO VERIFY"
            />
          </FieldRow>
          <FieldRow label="TRN" htmlFor="trn">
            <Input id="trn" name="trn" defaultValue={settings.trn} placeholder="TO VERIFY" />
          </FieldRow>
          <div className="md:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function IntegrationsList({ integrations }: { integrations: Integration[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Connected services</CardTitle>
        <CardDescription>
          Set the status that reflects how each integration is wired today.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-brand-primary/10 divide-y">
        {integrations.map((row) => (
          <form
            key={row.name}
            action={setIntegrationStatusAction}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <input type="hidden" name="name" value={row.name} />
            <span className="text-ink text-sm font-medium">{row.name}</span>
            <div className="flex items-center gap-3">
              <Badge variant={STATUS_VARIANT[row.status]}>{row.status.replace('_', ' ')}</Badge>
              <Select name="status" defaultValue={row.status} className="h-9 w-44 text-sm">
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <Button type="submit" variant="ghost" size="sm">
                Update
              </Button>
            </div>
          </form>
        ))}
      </CardContent>
    </Card>
  );
}

export function SocialLinksForm({ settings }: { settings: Settings }) {
  const [pending, startTransition] = useTransition();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Social media</CardTitle>
        <CardDescription>
          URLs you set here appear as icons in the customer footer. Leave any field empty to hide
          that channel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={(fd) =>
            startTransition(async () => {
              await updateSocialLinksAction(fd);
            })
          }
          className="space-y-3"
        >
          {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => {
            const current = settings.socialLinks?.[key] ?? '';
            return (
              <div key={key} className="grid items-center gap-2 sm:grid-cols-[180px_1fr_auto]">
                <label
                  htmlFor={`social-${key}`}
                  className="text-ink flex items-center gap-2 text-sm font-medium"
                >
                  <span
                    aria-hidden
                    className="bg-brand-secondary-soft text-brand-primary inline-flex h-7 w-7 items-center justify-center rounded-md"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {label}
                </label>
                <Input
                  id={`social-${key}`}
                  name={key}
                  type="url"
                  defaultValue={current}
                  placeholder={placeholder}
                />
                {current ? (
                  <a
                    href={current}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-secondary text-xs font-medium hover:underline"
                  >
                    Open ↗
                  </a>
                ) : (
                  <span className="text-ink-subtle text-[10px] uppercase tracking-wider">
                    Hidden
                  </span>
                )}
              </div>
            );
          })}
          <div className="pt-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save social links'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function ResetToSeedButton() {
  return (
    <ConfirmActionForm
      trigger={
        <Button variant="outline" size="sm">
          Reset demo data
        </Button>
      }
      title="Reset to seed data?"
      description="This wipes every change in the local store and restores the original sample dataset."
      action={async () => {
        await resetToSeedAction();
      }}
      hiddenFields={{}}
      confirmLabel="Reset"
    />
  );
}
