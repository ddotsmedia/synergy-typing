import { ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@synergy/ui/card';
import { Badge } from '@synergy/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@synergy/ui/table';
import { PageHeader } from '@/components/page-header';
import { DeleteStaffButton, EditStaffButton, InviteStaffButton } from '@/components/staff-dialogs';
import { listStaff, ROLE_LABEL } from '@synergy/db';
import type { StaffRole } from '@synergy/db/types';

const roleVariant: Record<StaffRole, 'default' | 'success' | 'secondary'> = {
  admin: 'default',
  reviewer: 'secondary',
  staff: 'success',
};

export default function StaffPage() {
  const staff = listStaff();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organisation"
        title="Staff"
        description="Reviewers and back-office staff with access to the admin console."
        actions={<InviteStaffButton />}
      />

      <Card>
        <CardContent className="p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-end">Open work</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="bg-brand-secondary/15 text-brand-primary inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
                        {u.name
                          .split(' ')
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join('')}
                      </span>
                      <span className="text-ink text-sm font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted text-sm">{u.email}</TableCell>
                  <TableCell className="text-ink/80 text-sm">{u.branch}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[u.role]}>
                      <ShieldCheck className="me-1 h-3 w-3" />
                      {ROLE_LABEL[u.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end font-mono text-sm">
                    {u.activeApplications}
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      <EditStaffButton user={u} />
                      <DeleteStaffButton user={u} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
