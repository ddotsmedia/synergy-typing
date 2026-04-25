// Placeholder catalogue for the cmdk palette during STEP 1.
// Real, DB-backed catalogue arrives in STEP 2.

export type CatalogueEntry = {
  slug: string;
  category: 'immigration' | 'labour' | 'company' | 'transport' | 'realEstate' | 'attestation';
  en: string;
  ar: string;
};

export const servicesCatalogue: CatalogueEntry[] = [
  { slug: 'employment-visa', category: 'immigration', en: 'Employment visa', ar: 'تأشيرة عمل' },
  { slug: 'family-visa', category: 'immigration', en: 'Family visa', ar: 'تأشيرة عائلية' },
  {
    slug: 'emirates-id-renewal',
    category: 'immigration',
    en: 'Emirates ID renewal',
    ar: 'تجديد الهوية الإماراتية',
  },
  { slug: 'work-permit', category: 'labour', en: 'Work permit', ar: 'تصريح عمل' },
  { slug: 'labour-contract', category: 'labour', en: 'Labour contract', ar: 'عقد عمل' },
  {
    slug: 'trade-licence-renewal',
    category: 'company',
    en: 'Trade licence renewal',
    ar: 'تجديد رخصة تجارية',
  },
  { slug: 'driving-licence', category: 'transport', en: 'Driving licence', ar: 'رخصة قيادة' },
  {
    slug: 'mulkiya-renewal',
    category: 'transport',
    en: 'Vehicle registration (Mulkiya)',
    ar: 'تجديد ملكية السيارة',
  },
  { slug: 'tawtheeq', category: 'realEstate', en: 'Tawtheeq tenancy', ar: 'توثيق عقد الإيجار' },
  {
    slug: 'mofa-attestation',
    category: 'attestation',
    en: 'MOFA attestation',
    ar: 'تصديق وزارة الخارجية',
  },
];
