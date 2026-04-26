export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@synergy/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@synergy/ui/tabs';
import { PageHeader } from '@/components/page-header';
import {
  BranchForm,
  IntegrationsList,
  ResetToSeedButton,
  SocialLinksForm,
} from '@/components/settings-forms';
import { getSettings, listIntegrations } from '@synergy/db';

export default function SettingsPage() {
  const settings = getSettings();
  const integrations = listIntegrations();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organisation"
        title="Settings"
        description="Branch information, integrations, and admin preferences."
        actions={<ResetToSeedButton />}
      />

      <Tabs defaultValue="branch">
        <TabsList>
          <TabsTrigger value="branch">Branch</TabsTrigger>
          <TabsTrigger value="social">Social media</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="branch">
          <BranchForm settings={settings} />
        </TabsContent>

        <TabsContent value="social">
          <SocialLinksForm settings={settings} />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsList integrations={integrations} />
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security posture</CardTitle>
              <CardDescription>
                Auth.js sign-in (magic link + Google + UAE Pass placeholder) lands with the customer
                site. Admin uses the same provider with role gates.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted space-y-2 text-sm">
              <p>· Sessions expire after 30 minutes of inactivity.</p>
              <p>· Emirates ID never logged in plaintext.</p>
              <p>· Document URLs signed and expire in 5 minutes.</p>
              <p>· Audit log is append-only and exported nightly.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
