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
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-2 px-2 py-2 sm:gap-4 sm:px-4 sm:py-4 lg:px-8">
        {children}
        <AgendaContainer />
      </div>
    </>
  );
}
