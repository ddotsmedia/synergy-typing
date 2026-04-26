export const dynamic = 'force-dynamic';

import { Card, CardContent, CardHeader, CardTitle } from '@synergy/ui/card';
import { PageHeader } from '@/components/page-header';
import {
  DeleteFaqButton,
  EditFaqButton,
  NewFaqButton,
  ToggleFaqPublishedForm,
} from '@/components/faq-dialogs';
import { listFaqs } from '@synergy/db';

export default function FaqsPage() {
  const faqs = listFaqs();
  const grouped = faqs.reduce<Record<string, typeof faqs>>((acc, f) => {
    acc[f.category] = acc[f.category] || [];
    acc[f.category]!.push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalogue"
        title="FAQs"
        description="Frequently-asked questions surfaced on each service page and the AI assistant."
        actions={<NewFaqButton />}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(grouped).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-base">{category}</CardTitle>
            </CardHeader>
            <CardContent className="divide-brand-primary/10 divide-y px-2 pb-2 pt-0">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 px-2 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-ink text-sm font-medium">{item.question}</p>
                    <p className="text-muted mt-1 text-xs">{item.answer}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <ToggleFaqPublishedForm faq={item} />
                    <EditFaqButton faq={item} />
                    <DeleteFaqButton faq={item} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        {Object.keys(grouped).length === 0 ? (
          <Card>
            <CardContent className="text-muted py-12 text-center text-sm">
              No FAQs yet. Use the Add FAQ button above.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
