import type { Metadata } from 'next';
import './globals.css';
import { LangProvider } from './components/LanguageToggle';
import SeabirdChatBot from './components/SeabirdChatBot';

export const metadata: Metadata = {
  title: 'Seabird Restaurant — Wilmington, NC | Coastal Fine Dining',
  description: 'Celebrating the coast of North Carolina. Fresh seafood, coastal cuisine, and warm hospitality at 1 S. Front St, Downtown Wilmington.',
  openGraph: {
    title: 'Seabird Restaurant — Wilmington, NC',
    description: 'Celebrating the coast of North Carolina.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LangProvider>
          {children}
          <SeabirdChatBot />
        </LangProvider>
      </body>
    </html>
  );
}
