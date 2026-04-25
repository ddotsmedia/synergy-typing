export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'missing_docs'
  | 'with_government'
  | 'approved'
  | 'rejected'
  | 'closed';

export type ServiceCategory =
  | 'immigration'
  | 'labour'
  | 'company'
  | 'transport'
  | 'realEstate'
  | 'attestation'
  | 'medical'
  | 'other';

export type StaffRole = 'admin' | 'staff' | 'reviewer';

export type Customer = {
  id: string;
  name: string;
  emiratesId: string;
  email: string;
  phone: string;
  joinedAt: string;
  applications: number;
};

export type Service = {
  id: string;
  slug: string;
  category: ServiceCategory;
  titleEn: string;
  titleAr: string;
  authority: string;
  govFee: number;
  serviceFee: number;
  processingDays: number;
  active: boolean;
  /**
   * When false, the customer-facing site hides the fee breakdown ("On request"
   * instead). Applications are still accepted and the actual fees are
   * snapshotted for invoicing and shown in /track + admin.
   */
  feesVisible: boolean;
};

export type Staff = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  branch: string;
  activeApplications: number;
};

export type Faq = {
  id: string;
  category: string;
  question: string;
  answer: string;
  published: boolean;
};

export type ApplicationDocument = {
  name: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
};

export type ApplicationEvent = {
  at: string;
  actor: string;
  action: string;
  note?: string;
};

export type Application = {
  id: string;
  reference: string;
  customerId: string;
  serviceId: string;
  status: ApplicationStatus;
  assignedTo?: string;
  submittedAt: string;
  updatedAt: string;
  govFee: number;
  serviceFee: number;
  vat: number;
  total: number;
  documents: ApplicationDocument[];
  events: ApplicationEvent[];
};

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  meta?: string;
};

export const SOCIAL_PLATFORMS = [
  'facebook',
  'instagram',
  'twitter',
  'linkedin',
  'youtube',
  'tiktok',
  'snapchat',
  'whatsappChannel',
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export type SocialLinks = Record<SocialPlatform, string>;

export type Settings = {
  tradeName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  licence: string;
  trn: string;
  socialLinks: SocialLinks;
};

export type Integration = {
  name: string;
  status: 'connected' | 'sandbox' | 'not_connected' | 'planned';
};
