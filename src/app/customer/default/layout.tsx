import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from 'components/customer/layout/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Customer Portal - Welcome',
  description: 'Welcome to your customer portal',
};

export default function CustomerLandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div
        className={cn(
          'min-h-screen bg-background',
          inter.className,
        )}
      >
        {children}
      </div>
    </ThemeProvider>
  );
}
