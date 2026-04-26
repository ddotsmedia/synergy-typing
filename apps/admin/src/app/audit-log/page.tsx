export const dynamic = 'force-dynamic';

import { Download, Filter } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { Card, CardContent } from '@synergy/ui/card';
import { Input } from '@synergy/ui/input';
import { Badge } from '@synergy/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@synergy/ui/table';
import { PageHeader } from '@/components/page-header';
import { formatDateTime, listAudit, relativeTime } from '@synergy/db';

function actionVariant(
  action: string,
): 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted' {
  if (action.includes('rejected') || action.includes('deleted') || action.includes('removed'))
    return 'danger';
  if (
    action.includes('verified') ||
    action.includes('approved') ||
    action.includes('created') ||
    action.includes('invited')
  )
    return 'success';
  if (
    action.includes('submitted') ||
    action.includes('draft_created') ||
    action.includes('updated')
  )
    return 'secondary';
  if (
    action.includes('transitioned') ||
    action.includes('sent_to_authority') ||
    action.includes('assigned')
  )
    return 'default';
  if (action.includes('closed') || action.includes('unpublished') || action.includes('deactivated'))
    return 'muted';
  return 'warning';
}

export default function AuditLogPage() {
  const entries = listAudit();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organisation"
        title="Audit log"
        description="Every staff and system action recorded for compliance and post-mortems. Append-only."
        actions={
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[18rem] flex-1">
              <Input placeholder="Filter by actor, action or target reference…" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" /> All actions
            </Button>
            <Button variant="outline" size="sm">
              All actors
            </Button>
            <Button variant="outline" size="sm">
              Last 7 days
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-muted whitespace-nowrap text-xs">
                    <div>{formatDateTime(entry.at)}</div>
                    <div className="text-[10px] uppercase tracking-wider">
                      {relativeTime(entry.at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-ink/80 text-sm">{entry.actor}</TableCell>
                  <TableCell>
                    <Badge variant={actionVariant(entry.action)}>{entry.action}</Badge>
                  </TableCell>
                  <TableCell className="text-brand-primary font-mono text-xs">
                    {entry.target}
                  </TableCell>
                  <TableCell className="text-muted text-sm">{entry.meta}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
