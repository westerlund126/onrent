// /app/owner/fitting/schedule/layout.tsx
import { ScheduleInitializer } from 'components/admin/fitting/calendar/schedule-data-initializer';
import { AgendaContainer } from 'components/admin/fitting/calendar/agenda-container';

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
        <AgendaContainer />
      </div>
    </>
  );
}