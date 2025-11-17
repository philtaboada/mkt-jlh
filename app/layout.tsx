import type { Metadata } from 'next';

import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import AuthProvider from '@/providers/AuthProvider';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'CRM MARKETING',
  description: 'Sistema de gestión de relaciones con clientes y redes sociales',
  generator: 'CRM MARKETING JLH',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <Toaster position="top-right" />
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
