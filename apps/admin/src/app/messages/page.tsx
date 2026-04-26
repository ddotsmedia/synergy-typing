import { Archive, Mail, MailOpen, MessageCircle, Phone, Trash2 } from 'lucide-react';
import { brand } from '@synergy/config/tokens/brand';
import {
  formatDateTime,
  getService,
  listMessages,
  MESSAGE_SUBJECT_LABEL,
  relativeTime,
} from '@synergy/db';
import type { Message } from '@synergy/db/types';
import { Badge } from '@synergy/ui/badge';
import { Button } from '@synergy/ui/button';
import { Card, CardContent } from '@synergy/ui/card';
import { PageHeader } from '@/components/page-header';
import { setMessageStatusAction, deleteMessageAction } from '@/actions/messages';
import { ConfirmActionForm } from '@/components/form-dialog';

const STATUS_VARIANT: Record<Message['status'], 'warning' | 'muted' | 'secondary'> = {
  unread: 'warning',
  read: 'muted',
  archived: 'secondary',
};

const STATUS_LABEL: Record<Message['status'], string> = {
  unread: 'Unread',
  read: 'Read',
  archived: 'Archived',
};

export default function MessagesPage() {
  const messages = listMessages();
  const unread = messages.filter((m) => m.status === 'unread').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Messages"
        description={`Customer messages from the contact form. ${unread > 0 ? `${unread} unread.` : 'All caught up.'}`}
      />

      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Mail className="text-ink-subtle mx-auto h-8 w-8" aria-hidden />
            <p className="text-brand-primary mt-3 text-base font-semibold">No messages yet</p>
            <p className="text-ink-muted mt-1 text-sm">
              Customer submissions from the contact form will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => {
            const service = m.serviceId ? getService(m.serviceId) : undefined;
            const waHref = `https://wa.me/${(m.phone || brand.contact.whatsapp).replace(/\D/g, '')}`;
            return (
              <li key={m.id}>
                <Card className={m.status === 'unread' ? 'border-warning/30 shadow-sm' : ''}>
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={STATUS_VARIANT[m.status]}>{STATUS_LABEL[m.status]}</Badge>
                          {m.subject ? (
                            <Badge variant="secondary">{MESSAGE_SUBJECT_LABEL[m.subject]}</Badge>
                          ) : null}
                          {service ? <Badge variant="outline">re: {service.titleEn}</Badge> : null}
                          <span className="text-ink-subtle text-[11px] uppercase tracking-wider">
                            {relativeTime(m.createdAt)} · {formatDateTime(m.createdAt)}
                          </span>
                        </div>
                        <p className="text-brand-primary mt-2 text-base font-semibold">{m.name}</p>
                        <p className="text-ink-muted text-xs">
                          <a href={`mailto:${m.email}`} className="hover:text-brand-primary">
                            {m.email}
                          </a>
                          {m.phone ? (
                            <>
                              {' · '}
                              <a href={`tel:${m.phone}`} className="hover:text-brand-primary">
                                {m.phone}
                              </a>
                            </>
                          ) : null}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-1">
                        {m.status === 'unread' ? (
                          <form action={setMessageStatusAction}>
                            <input type="hidden" name="id" value={m.id} />
                            <input type="hidden" name="status" value="read" />
                            <Button type="submit" variant="ghost" size="sm" title="Mark as read">
                              <MailOpen className="h-4 w-4" aria-hidden />
                            </Button>
                          </form>
                        ) : (
                          <form action={setMessageStatusAction}>
                            <input type="hidden" name="id" value={m.id} />
                            <input type="hidden" name="status" value="unread" />
                            <Button type="submit" variant="ghost" size="sm" title="Mark as unread">
                              <Mail className="h-4 w-4" aria-hidden />
                            </Button>
                          </form>
                        )}
                        {m.status !== 'archived' ? (
                          <form action={setMessageStatusAction}>
                            <input type="hidden" name="id" value={m.id} />
                            <input type="hidden" name="status" value="archived" />
                            <Button type="submit" variant="ghost" size="sm" title="Archive">
                              <Archive className="h-4 w-4" aria-hidden />
                            </Button>
                          </form>
                        ) : null}
                        <ConfirmActionForm
                          trigger={
                            <Button variant="ghost" size="sm" title="Delete">
                              <Trash2 className="text-danger h-4 w-4" aria-hidden />
                            </Button>
                          }
                          title={`Delete message from ${m.name}?`}
                          description="This is permanent. The message stays in the audit log."
                          action={deleteMessageAction}
                          hiddenFields={{ id: m.id }}
                        />
                      </div>
                    </div>

                    <div className="border-subtle bg-surface text-ink whitespace-pre-wrap rounded-lg border p-4 text-sm leading-relaxed">
                      {m.body}
                    </div>

                    <div className="border-subtle flex flex-wrap items-center gap-2 border-t pt-3 text-xs">
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={`mailto:${m.email}?subject=Re:%20${encodeURIComponent(MESSAGE_SUBJECT_LABEL[m.subject ?? 'general'])}`}
                        >
                          <Mail className="h-3.5 w-3.5" /> Reply by email
                        </a>
                      </Button>
                      {m.phone ? (
                        <>
                          <Button asChild variant="outline" size="sm">
                            <a href={waHref} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                            </a>
                          </Button>
                          <Button asChild variant="ghost" size="sm">
                            <a href={`tel:${m.phone}`}>
                              <Phone className="h-3.5 w-3.5" /> Call
                            </a>
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
