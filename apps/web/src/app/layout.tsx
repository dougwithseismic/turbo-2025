import { AuthProvider } from '@/features/auth/providers/auth-provider';
import { ThemeProvider } from '@/features/theme/providers/theme-provider';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

import { themes } from '@/features/theme/config/themes';
import { Toaster } from 'react-hot-toast';
import { FloatingThemeSelector } from '@/features/theme/components/floating-theme-selector';

export const viewport: Viewport = {
  themeColor: [
    ...themes.map((theme) => ({
      media: `(prefers-color-scheme: ${theme.id})`,
      color: theme.themeColor,
    })),
  ],
};

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <FloatingThemeSelector />
            <Toaster position="bottom-right" />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
