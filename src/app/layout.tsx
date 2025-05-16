import React, { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { idID } from '@clerk/localizations';
import { Provider } from "../components/ui/provider";
import AppWrappers from './AppWrappers';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider localization={idID}>
      <html lang="en" suppressHydrationWarning>
        <body id={'root'}>
          <Provider>
            <AppWrappers>{children}</AppWrappers>
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}