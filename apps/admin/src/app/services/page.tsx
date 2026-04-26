export const dynamic = 'force-dynamic';

import { Card, CardContent } from '@synergy/ui/card';
import { Input } from '@synergy/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@synergy/ui/table';
import { PageHeader } from '@/components/page-header';
import {
  DeleteServiceButton,
  EditServiceButton,
  NewServiceButton,
  ToggleFeesVisibleForm,
  ToggleServiceActiveForm,
} from '@/components/service-dialogs';
import { CATEGORY_LABEL, formatAed, listServices } from '@synergy/db';
import type { ServiceCategory } from '@synergy/db/types';

const CATEGORIES = Object.keys(CATEGORY_LABEL) as ServiceCategory[];

export default function ServicesPage() {
  const services = listServices();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalogue"
        title="Services"
        description="The bilingual service catalogue customers see on the website."
        actions={<NewServiceButton />}
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <Input placeholder="Search services…" />
          <div className="flex flex-wrap gap-2">
            <button className="bg-brand-primary rounded-full px-3 py-1 text-xs font-semibold text-white">
              All · {services.length}
            </button>
            {CATEGORIES.map((cat) => {
              const count = services.filter((s) => s.category === cat).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  className="border-brand-primary/15 text-ink/80 hover:border-brand-secondary hover:text-brand-primary rounded-full border bg-white px-3 py-1 text-xs font-medium"
                >
                  {CATEGORY_LABEL[cat]} · {count}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Authority</TableHead>
                <TableHead className="text-end">Gov fee</TableHead>
                <TableHead className="text-end">Service fee</TableHead>
                <TableHead className="text-end">SLA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Public fees</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="text-ink text-sm font-medium">{s.titleEn}</p>
                    <p className="text-muted text-xs" dir="rtl">
                      {s.titleAr}
                    </p>
                  </TableCell>
                  <TableCell className="text-ink/80 text-sm">
                    {CATEGORY_LABEL[s.category]}
                  </TableCell>
                  <TableCell className="text-muted text-sm">{s.authority}</TableCell>
                  <TableCell className="text-end font-mono text-sm">
                    {formatAed(s.govFee)}
                  </TableCell>
                  <TableCell className="text-end font-mono text-sm">
                    {formatAed(s.serviceFee)}
                  </TableCell>
                  <TableCell className="text-muted text-end text-sm">{s.processingDays}d</TableCell>
                  <TableCell>
                    <ToggleServiceActiveForm service={s} />
                  </TableCell>
                  <TableCell>
                    <ToggleFeesVisibleForm service={s} />
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      <EditServiceButton service={s} />
                      <DeleteServiceButton service={s} />
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
