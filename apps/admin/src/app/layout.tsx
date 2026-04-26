import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import { unreadMessageCount } from '@synergy/db';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import './globals.css';

const cairo = Cairo({ subsets: ['latin'], variable: '--font-cairo', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Synergy Admin',
  description: 'Staff console for Synergy Typing Services.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Build the nav with the live unread-message count badge.
  let unread = 0;
  try {
    unread = unreadMessageCount();
  } catch {
    /* store may not exist at build time — fall back to 0 */
  }
  const badges = { '/messages': unread > 0 ? String(unread) : undefined };

  return (
    <html lang="en" className={`${cairo.variable} ${inter.variable}`}>
      <body className="bg-surface text-ink min-h-screen font-sans antialiased">
        <div className="flex min-h-screen">
          <aside className="border-subtle hidden w-64 shrink-0 border-e bg-white md:block">
            <Sidebar badges={badges} />
          </aside>
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1 px-4 py-8 md:px-10 md:py-10">
              <div className="mx-auto w-full max-w-[1280px]">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
