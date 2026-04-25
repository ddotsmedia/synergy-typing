import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ChevronRight, FileText, RefreshCw, ShieldCheck } from 'lucide-react';
import { Badge } from '@synergy/ui/badge';
import { Button } from '@synergy/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@synergy/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@synergy/ui/tabs';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import {
  AddNoteButton,
  AdvanceStateButton,
  AssignButton,
  DocumentRowActions,
  RequestDocumentsButton,
} from '@/components/application-actions';
import {
  formatAed,
  formatDateTime,
  getApplication,
  getCustomer,
  getService,
  getStaff,
  listStaff,
  nextStatesFor,
} from '@synergy/db';

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = getApplication(id);
  if (!app) notFound();
  const customer = getCustomer(app.customerId);
  const service = getService(app.serviceId);
  const assignee = getStaff(app.assignedTo);
  const staff = listStaff();
  const nextStates = nextStatesFor(app.status);

  return (
    <div className="space-y-6">
      <Link
        href="/applications"
        className="text-muted hover:text-brand-primary inline-flex items-center gap-1 text-xs font-medium transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to queue
      </Link>

      <PageHeader
        eyebrow={`Application · ${app.reference}`}
        title={service?.titleEn ?? 'Application'}
        description={`Authority: ${service?.authority ?? 'n/a'} · Submitted ${formatDateTime(app.submittedAt)}`}
        actions={
          <>
            <AssignButton application={app} staff={staff} />
            <RequestDocumentsButton application={app} />
            <AddNoteButton application={app} />
            <AdvanceStateButton application={app} nextStates={nextStates} />
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={app.status} />
        {assignee ? (
          <Badge variant="outline">Assigned to {assignee.name}</Badge>
        ) : (
          <Badge variant="warning">Unassigned</Badge>
        )}
        <span className="text-muted text-sm">Last updated {formatDateTime(app.updatedAt)}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">State machine</CardTitle>
              <CardDescription>
                Lifecycle of this application — every transition is recorded.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="border-brand-primary/10 space-y-4 border-s-2 ps-6">
                {[...app.events].reverse().map((evt, i) => (
                  <li key={i} className="relative">
                    <span className="bg-brand-secondary absolute -start-[31px] mt-1 inline-flex h-3 w-3 rounded-full border-2 border-white shadow-sm" />
                    <p className="text-ink text-sm font-medium">{evt.action}</p>
                    {evt.note ? <p className="text-muted text-xs">{evt.note}</p> : null}
                    <p className="text-muted mt-0.5 text-[11px] uppercase tracking-wider">
                      {formatDateTime(evt.at)} · {evt.actor}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents</CardTitle>
              <CardDescription>
                Verify or reject — the customer is notified on each change (stub).
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-brand-primary/10 divide-y">
              {app.documents.length === 0 ? (
                <p className="text-muted py-6 text-center text-sm">No documents uploaded yet.</p>
              ) : (
                app.documents.map((doc) => {
                  const variant =
                    doc.status === 'verified'
                      ? 'success'
                      : doc.status === 'rejected'
                        ? 'danger'
                        : 'warning';
                  return (
                    <div key={doc.name} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-surface text-brand-primary inline-flex h-9 w-9 items-center justify-center rounded-md">
                          <FileText className="h-4 w-4" aria-hidden />
                        </span>
                        <div>
                          <p className="text-ink text-sm font-medium">{doc.name}</p>
                          <p className="text-muted text-xs">
                            Uploaded {formatDateTime(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={variant}>{doc.status}</Badge>
                        <DocumentRowActions applicationId={app.id} doc={doc} />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
              <CardDescription>Internal context vs. customer-visible thread.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="notes">
                <TabsList>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="messages">Customer messages</TabsTrigger>
                </TabsList>
                <TabsContent value="notes" className="space-y-2">
                  {app.events.filter((e) => e.action === 'Note added').length === 0 ? (
                    <p className="text-muted text-sm">
                      No notes yet. Use the Add note button above.
                    </p>
                  ) : (
                    app.events
                      .filter((e) => e.action === 'Note added')
                      .reverse()
                      .map((e, i) => (
                        <div
                          key={i}
                          className="border-brand-primary/10 bg-surface rounded-md border p-3 text-sm"
                        >
                          <p className="text-ink">{e.note}</p>
                          <p className="text-muted mt-1 text-[11px] uppercase tracking-wider">
                            {formatDateTime(e.at)} · {e.actor}
                          </p>
                        </div>
                      ))
                  )}
                </TabsContent>
                <TabsContent value="messages" className="text-muted text-sm">
                  Messages thread will appear here once WhatsApp Business API is connected (Phase
                  2).
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-brand-primary font-semibold">{customer?.name}</p>
              <p className="text-muted">{customer?.email}</p>
              <p className="text-muted">{customer?.phone}</p>
              <p className="text-muted font-mono text-xs">
                EID ••••{customer?.emiratesId.slice(-4)}
              </p>
              <Button variant="outline" size="sm" asChild className="mt-3 w-full">
                <Link href={`/customers`}>
                  Open customer profile <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fee breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Government fee</span>
                <span className="font-mono">{formatAed(app.govFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Service fee</span>
                <span className="font-mono">{formatAed(app.serviceFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">VAT (5%)</span>
                <span className="font-mono">{formatAed(app.vat)}</span>
              </div>
              <div className="bg-brand-primary/10 my-2 h-px" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-brand-primary font-mono">{formatAed(app.total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="text-brand-secondary h-4 w-4" /> Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted space-y-2 text-xs">
              <p>· Emirates ID never shown in full to non-admins.</p>
              <p>· Documents auto-purge 90 days after closure.</p>
              <p>· Every action recorded in audit log.</p>
              <Button variant="ghost" size="sm" asChild className="mt-2 w-full">
                <Link href="/audit-log">
                  <RefreshCw className="h-3.5 w-3.5" /> View audit trail
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
