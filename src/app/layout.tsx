import React, { ReactNode } from 'react';
import { ClerkProvider, useUser } from '@clerk/nextjs';
import { idID } from '@clerk/localizations';
import AppWrappers from './AppWrappers';
import { Toaster } from '@/components/ui/sonner';
import OneSignalInit from 'components/OneSignalInit';

export default function RootLayout({ children }: { children: ReactNode }) {
  const { isSignedIn, user } = useUser();
  return (
    <ClerkProvider localization={idID}>
      {isSignedIn && <OneSignalInit userId={user?.id} />}
      <html lang="en" suppressHydrationWarning>
        <body id={'root'}>
            <AppWrappers>{children}</AppWrappers>
            <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}