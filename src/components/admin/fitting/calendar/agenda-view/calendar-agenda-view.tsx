import { useMemo } from "react";
import { CalendarX2 } from "lucide-react";
import { parseISO, format, endOfDay, startOfDay, isSameMonth } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgendaDayGroup } from 'components/admin/fitting/calendar/agenda-view/agenda-day-group';
import type { ICalendarEvent, IFittingSchedule } from 'types/fitting';
import { useFittingStore } from "stores";

interface IProps {
  singleDaySchedule: IFittingSchedule[];
}

export function CalendarAgendaView({ singleDaySchedule }: IProps) {
  const { selectedDate } = useFittingStore();

  const calendarEvents = useMemo((): ICalendarEvent[] => {
    return singleDaySchedule.map((schedule) => ({
      id: schedule.id,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      title: schedule.title,
      color: schedule.color,
      type: 'fitting' as const,
      originalData: schedule,
    }));
  }, [singleDaySchedule]);

  const scheduleByDay = useMemo(() => {
    const allDates = new Map<
      string,
      { date: Date; schedule: ICalendarEvent[] }
    >();

    calendarEvents.forEach((event) => {
      const eventDate = event.startTime;
      if (!isSameMonth(eventDate, selectedDate)) return;

      const dateKey = format(eventDate, 'yyyy-MM-dd');

      if (!allDates.has(dateKey)) {
        allDates.set(dateKey, {
          date: startOfDay(eventDate),
          schedule: [],
        });
      }

      allDates.get(dateKey)?.schedule.push(event);
    });

    return Array.from(allDates.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }, [calendarEvents, selectedDate]);
  
  const hasAnySchedule =
    singleDaySchedule.length > 0 ;

  return (
    <div className="h-[800px]">
      <ScrollArea className="h-full" type="always">
        <div className="space-y-6 p-4">
          {scheduleByDay.map((dayGroup) => (
            <AgendaDayGroup
              key={format(dayGroup.date, 'yyyy-MM-dd')}
              date={dayGroup.date}
              schedule={dayGroup.schedule}
            />
          ))}

          {!hasAnySchedule && (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
              <CalendarX2 className="size-10" />
              <p className="text-sm md:text-base">
                Tidak Ada Jadwal Fitting pada Tanggal Ini
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
