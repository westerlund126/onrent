// app/layout.tsx 
'use client';

import React, { ReactNode } from 'react';
import { ClerkProvider, useUser } from '@clerk/nextjs';
import { idID } from '@clerk/localizations';
import AppWrappers from './AppWrappers';
import { Toaster } from '@/components/ui/sonner';
import OneSignalInit from 'components/OneSignalInit';


function OneSignalWrapper() {
  const { user } = useUser();
  return <OneSignalInit userId={user?.id} />;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider localization={idID}>
      <html lang="en" suppressHydrationWarning>
        <body id={'root'}>
          <OneSignalWrapper />
          <AppWrappers>{children}</AppWrappers>
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
