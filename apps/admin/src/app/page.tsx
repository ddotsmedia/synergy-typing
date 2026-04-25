import Link from 'next/link';
import {
  ArrowRight,
  BadgeAlert,
  BarChart3,
  Briefcase,
  ClipboardList,
  FileCheck2,
  Inbox,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@synergy/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@synergy/ui/table';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import {
  deriveKpis,
  formatAed,
  formatDateTime,
  getCustomer,
  getService,
  getStaff,
  listApplications,
  STATUS_LABEL,
  statusCounts,
  topServices,
} from '@synergy/db';

export default function Dashboard() {
  const kpis = deriveKpis();
  const recent = listApplications().slice(0, 6);
  const top = topServices(5);
  const counts = statusCounts();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Today · 25 Apr 2026"
        title="Dashboard"
        description="A snapshot of customer activity, revenue, and what your team is working on."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/audit-log">
                <ClipboardList className="h-4 w-4" /> Audit log
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/applications">
                Open queue <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Applications today"
          value={String(kpis.todayCount)}
          delta={`${kpis.totalApplications} total`}
          trend="up"
          icon={Inbox}
          accent="primary"
        />
        <StatCard
          label="Revenue (today)"
          value={formatAed(kpis.revenueToday)}
          delta="+18% vs yesterday"
          trend="up"
          icon={TrendingUp}
          accent="success"
        />
        <StatCard
          label="In review"
          value={String(kpis.inReview)}
          delta={`${kpis.closedThisWeek} closed this week`}
          trend="flat"
          icon={FileCheck2}
          accent="secondary"
        />
        <StatCard
          label="SLA breaches"
          value={String(kpis.slaBreaches)}
          delta="48-hour threshold"
          trend={kpis.slaBreaches > 0 ? 'down' : 'flat'}
          icon={BadgeAlert}
          accent={kpis.slaBreaches > 0 ? 'warning' : 'success'}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>
                Most-recently updated applications across all teams.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/applications">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-2 pb-3 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead className="text-end">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((app) => {
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
                      <TableCell className="text-ink font-medium">{c?.name}</TableCell>
                      <TableCell className="text-ink/80 text-sm">{s?.titleEn}</TableCell>
                      <TableCell>
                        <StatusBadge status={app.status} />
                      </TableCell>
                      <TableCell className="text-muted text-sm">
                        {u ? u.name : <span className="italic">Unassigned</span>}
                      </TableCell>
                      <TableCell className="text-muted text-end text-xs">
                        {formatDateTime(app.updatedAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="text-brand-secondary h-4 w-4" /> Top services
              </CardTitle>
              <CardDescription>By application volume this period.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {top.map(({ service, count }) => {
                const max = top[0]?.count || 1;
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={service.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink font-medium">{service.titleEn}</span>
                      <span className="text-muted">{count}</span>
                    </div>
                    <div className="bg-surface h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-brand-secondary h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="text-brand-secondary h-4 w-4" /> Status mix
              </CardTitle>
              <CardDescription>Open vs. closed across the queue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(Object.keys(counts) as Array<keyof typeof counts>).map((key) => {
                const total = kpis.totalApplications || 1;
                const value = counts[key];
                if (value === 0) return null;
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-ink/80">{STATUS_LABEL[key]}</span>
                    <span className="text-muted">
                      {value}{' '}
                      <span className="text-xs">({Math.round((value / total) * 100)}%)</span>
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
