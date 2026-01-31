import type { Metadata } from 'next';
import './globals.css';
import { UserProvider } from '@/lib/UserContext';
import { CampaignProvider } from '@/lib/CampaignContext';

export const metadata: Metadata = {
  title: 'Campaign Portal',
  description: 'Your D&D campaign management tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <CampaignProvider>
            {children}
          </CampaignProvider>
        </UserProvider>
      </body>
    </html>
  );
}
