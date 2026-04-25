import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@synergy/ui/card';
import { Badge } from '@synergy/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@synergy/ui/table';
import { PageHeader } from '@/components/page-header';
import { EditFeesButton, ToggleFeesVisibleForm } from '@/components/service-dialogs';
import { CATEGORY_LABEL, formatAed, listServices } from '@synergy/db';

export default function FeesPage() {
  const services = listServices();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalogue"
        title="Fees"
        description="Government fees, service fees and the 5% VAT applied to the line total."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Government fee</CardTitle>
            <CardDescription>Pass-through to the relevant authority.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted text-sm">
            Pulled from the live authority schedule. <Badge variant="muted">Synced daily</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Service fee</CardTitle>
            <CardDescription>What Synergy charges to type, verify and submit.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted text-sm">
            Editable per service. Used in the customer-facing fee calculator.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">VAT</CardTitle>
            <CardDescription>5% of (gov fee + service fee).</CardDescription>
          </CardHeader>
          <CardContent className="text-muted text-sm">
            Auto-calculated. FTA-compliant invoices issued on payment.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-end">Gov fee</TableHead>
                <TableHead className="text-end">Service fee</TableHead>
                <TableHead className="text-end">VAT (5%)</TableHead>
                <TableHead className="text-end">Total</TableHead>
                <TableHead>Public</TableHead>
                <TableHead className="text-end">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => {
                const vat = Math.round((s.govFee + s.serviceFee) * 0.05);
                const total = s.govFee + s.serviceFee + vat;
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="text-ink text-sm font-medium">{s.titleEn}</p>
                      <p className="text-muted text-xs">{s.authority}</p>
                    </TableCell>
                    <TableCell className="text-ink/80 text-sm">
                      {CATEGORY_LABEL[s.category]}
                    </TableCell>
                    <TableCell className="text-end font-mono text-sm">
                      {formatAed(s.govFee)}
                    </TableCell>
                    <TableCell className="text-end font-mono text-sm">
                      {formatAed(s.serviceFee)}
                    </TableCell>
                    <TableCell className="text-muted text-end font-mono text-sm">
                      {formatAed(vat)}
                    </TableCell>
                    <TableCell className="text-brand-primary text-end font-mono text-sm font-semibold">
                      {formatAed(total)}
                    </TableCell>
                    <TableCell>
                      <ToggleFeesVisibleForm service={s} />
                    </TableCell>
                    <TableCell className="text-end">
                      <EditFeesButton service={s} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
