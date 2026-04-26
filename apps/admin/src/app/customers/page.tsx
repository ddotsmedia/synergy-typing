export const dynamic = 'force-dynamic';

import { Download } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { Card, CardContent } from '@synergy/ui/card';
import { Input } from '@synergy/ui/input';
import { Badge } from '@synergy/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@synergy/ui/table';
import { PageHeader } from '@/components/page-header';
import {
  DeleteCustomerButton,
  EditCustomerButton,
  NewCustomerButton,
} from '@/components/customer-dialogs';
import { listCustomers } from '@synergy/db';

export default function CustomersPage() {
  const customers = listCustomers();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Customers"
        description="Everyone who has interacted with the centre."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
            <NewCustomerButton />
          </>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[18rem] flex-1">
              <Input placeholder="Search by name, Emirates ID, email or phone…" />
            </div>
            <Button variant="outline" size="sm">
              All branches
            </Button>
            <Button variant="outline" size="sm">
              Joined: any time
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Emirates ID</TableHead>
                <TableHead className="text-end">Apps</TableHead>
                <TableHead className="text-end">Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="bg-brand-primary inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white">
                        {c.name
                          .split(' ')
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join('')}
                      </span>
                      <div>
                        <p className="text-ink text-sm font-medium">{c.name}</p>
                        <p className="text-muted text-xs">ID {c.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-ink/80 text-sm">{c.email}</p>
                    <p className="text-muted text-xs">{c.phone}</p>
                  </TableCell>
                  <TableCell className="text-muted font-mono text-xs">
                    {c.emiratesId ? `••••${c.emiratesId.slice(-4)}` : '—'}
                  </TableCell>
                  <TableCell className="text-end font-mono text-sm">{c.applications}</TableCell>
                  <TableCell className="text-muted text-end text-xs">{c.joinedAt}</TableCell>
                  <TableCell>
                    <Badge variant={c.applications > 0 ? 'success' : 'muted'}>
                      {c.applications > 0 ? 'Active' : 'Lead'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      <EditCustomerButton customer={c} />
                      <DeleteCustomerButton customer={c} />
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
