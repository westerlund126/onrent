// app/redirect/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from 'lib/prisma';

export default async function RedirectPage() {
  const { userId } = await auth();

  if (!userId) {
    return redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { role: true },
  });

  if (!user) {
    return redirect('/sign-in');
  }

  if (user.role === 'ADMIN') {
    return redirect('/admin/default');
  } else if (user.role === 'OWNER') {
    return redirect('/owner/default');
  } else if (user.role === 'CUSTOMER') {
    return redirect('/customer');
  }

  return redirect('/sign-in'); 
}
