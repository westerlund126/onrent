import { differenceInDays, format, parseISO, startOfDay } from "date-fns";

import { AgendaEventCard } from "components/admin/fitting/calendar/agenda-view/agenda-event-card";

import type { IFittingSchedule } from "types/fitting";

interface IProps {
  date: Date;
  schedule: IFittingSchedule[];
}

export function AgendaDayGroup({ date, schedule }: IProps) {
  const sortedSchedule = [...schedule].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="space-y-4">
      <div className="sticky top-0 flex items-center gap-4 bg-background py-2">
        <p className="text-sm font-semibold">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      <div className="space-y-2">
        {sortedSchedule.length > 0 &&
          sortedSchedule.map((schedule) => (
            <AgendaEventCard key={schedule.id} schedule={schedule} />
          ))}
      </div>
    </div>
  );
}
