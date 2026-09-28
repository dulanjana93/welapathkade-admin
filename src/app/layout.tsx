import type { Metadata } from 'next';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { messages } from '@/lib/i18n/en';
import './globals.css';

export const metadata: Metadata = {
  title: messages.appName,
  description: 'Welapathkade platform administration',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // Browser extensions (e.g. ColorZilla) inject attributes like
        // cz-shortcut-listen onto <body> before hydration.
        suppressHydrationWarning
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
