import Link from 'next/link';
import { Filter } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { Card, CardContent } from '@synergy/ui/card';
import { Input } from '@synergy/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@synergy/ui/table';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { NewApplicationButton } from '@/components/new-application-dialog';
import {
  formatAed,
  formatDateTime,
  getCustomer,
  getService,
  getStaff,
  listApplications,
  listCustomers,
  listServices,
  STATUS_LABEL,
  statusCounts,
} from '@synergy/db';
import type { ApplicationStatus } from '@synergy/db/types';

const STATUSES: ApplicationStatus[] = [
  'submitted',
  'under_review',
  'missing_docs',
  'with_government',
  'approved',
  'rejected',
  'closed',
  'draft',
];

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.status as ApplicationStatus | undefined;
  const apps = filter ? listApplications({ status: filter }) : listApplications();
  const counts = statusCounts();
  const total = listApplications().length;
  const customers = listCustomers();
  const services = listServices();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Applications queue"
        description="Triage, verify, and progress every customer application."
        actions={<NewApplicationButton customers={customers} services={services} />}
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[16rem] flex-1">
              <Input placeholder="Search by reference, customer name, Emirates ID…" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" /> All categories
            </Button>
            <Button variant="outline" size="sm">
              All assignees
            </Button>
            <Button variant="outline" size="sm">
              Last 7 days
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/applications"
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                !filter
                  ? 'border-brand-primary bg-brand-primary border text-white'
                  : 'border-brand-primary/15 text-ink/80 hover:border-brand-secondary border bg-white'
              }`}
            >
              All · {total}
            </Link>
            {STATUSES.map((s) => (
              <Link
                key={s}
                href={`/applications?status=${s}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === s
                    ? 'border-brand-primary bg-brand-primary border text-white'
                    : 'border-brand-primary/15 text-ink/80 hover:border-brand-secondary hover:text-brand-primary border bg-white'
                }`}
              >
                {STATUS_LABEL[s]} · {counts[s]}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead className="text-end">Total</TableHead>
                <TableHead className="text-end">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app) => {
                const c = getCustomer(app.customerId);
                const s = getService(app.serviceId);
                const u = getStaff(app.assignedTo);
                return (
                  <TableRow key={app.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={`/applications/${app.id}`}
                        className="text-brand-primary font-mono text-xs font-semibold hover:underline"
                      >
                        {app.reference}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="text-ink font-medium">{c?.name}</div>
                      <div className="text-muted text-xs">{c?.email}</div>
                    </TableCell>
                    <TableCell className="text-ink/80 text-sm">
                      {s?.titleEn ?? <span className="text-muted italic">deleted</span>}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell className="text-muted text-sm">
                      {u ? u.name : <span className="italic">Unassigned</span>}
                    </TableCell>
                    <TableCell className="text-end font-mono text-sm">
                      {formatAed(app.total)}
                    </TableCell>
                    <TableCell className="text-muted text-end text-xs">
                      {formatDateTime(app.updatedAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {apps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted py-12 text-center text-sm">
                    No applications match this filter.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
