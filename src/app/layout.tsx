import React, { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { idID } from '@clerk/localizations';
import AppWrappers from './AppWrappers';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider localization={idID}>
      <html lang="en" suppressHydrationWarning>
        <body id={'root'}>
            <AppWrappers>{children}</AppWrappers>
        </body>
      </html>
    </ClerkProvider>
  );
}