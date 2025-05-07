import React, { ReactNode } from 'react';
import AppWrappers from './AppWrappers';
import { ClerkProvider } from '@clerk/nextjs';
import { idID } from '@clerk/localizations';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider localization={idID} afterSignInUrl="/owner/default">
      <html lang="en">
        <body id={'root'}>
          <AppWrappers>{children}</AppWrappers>
        </body>
      </html>
    </ClerkProvider>
  );
}
