// /app/owner/fitting/schedule/layout.tsx
import { Settings } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { ScheduleInitializer } from 'components/admin/fitting/calendar/schedule-data-initializer';

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ScheduleInitializer />

      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4">
        {children}
        
      </div>
    </>
  );
}
