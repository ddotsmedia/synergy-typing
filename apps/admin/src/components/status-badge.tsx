import { Badge } from '@synergy/ui/badge';
import { STATUS_LABEL, STATUS_VARIANT } from '@synergy/db';
import type { ApplicationStatus } from '@synergy/db/types';

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
