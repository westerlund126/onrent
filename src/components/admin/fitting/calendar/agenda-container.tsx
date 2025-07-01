'use client';

import { useMemo } from 'react';
import { useSelectedDate, useFittingSchedules } from 'stores';
import { CalendarAgendaView } from 'components/admin/fitting/calendar/agenda-view/calendar-agenda-view';

export function AgendaContainer() {
  const selectedDate = useSelectedDate();
  const fittingSchedules = useFittingSchedules();

  const filteredSchedule = useMemo(() => {
    return fittingSchedules.filter((schedule) => {
      const scheduleStartTime = schedule.startTime;

      const monthStart = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1,
      );
      const monthEnd = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      const isInSelectedMonth =
        scheduleStartTime >= monthStart && scheduleStartTime <= monthEnd;
      return isInSelectedMonth;
    });
  }, [selectedDate, fittingSchedules]);

  return (
    <div className="overflow-hidden rounded-xl border-2 bg-white px-5">
      <div className="border-b px-4 py-3">
        <h2 className="text-lg font-semibold">Agenda</h2>
      </div>
      <CalendarAgendaView singleDaySchedule={filteredSchedule} />
    </div>
  );
}
