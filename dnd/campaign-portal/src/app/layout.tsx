import type {Metadata} from 'next';
import './globals.css';
import {UserProvider} from '@/lib/UserContext';
import {CampaignProvider} from '@/lib/CampaignContext';
import {AuthGuard} from "@/components/AuthGuard";

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
        <body className="bg-[#0a0c10]">
        <UserProvider>
            <CampaignProvider>
                <AuthGuard>
                    {children}
                </AuthGuard>
            </CampaignProvider>
        </UserProvider>
        </body>
        </html>
    );
}
