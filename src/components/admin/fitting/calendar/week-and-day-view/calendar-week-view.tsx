// calendar-month-view.tsx
import {
  startOfWeek,
  addDays,
  format,
  isSameDay,
  areIntervalsOverlapping,
  endOfWeek,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFittingStore } from 'stores';
import { useWorkingHoursStore } from 'stores/useWorkingHoursStore';
import { EventBlock } from 'components/admin/fitting/calendar/week-and-day-view/event-block';
import { CalendarTimeline } from 'components/admin/fitting/calendar/week-and-day-view/calendar-time-line';
import { cn } from '@/lib/utils';
import {
  groupSchedule,
  getScheduleBlockStyle,
  isWorkingHour,
  getStatusColor,
} from 'utils/helpers';
import type { ICalendarEvent, IFittingSchedule } from 'types/fitting';
import { useEffect, useMemo } from 'react';

export function CalendarWeekView() {
  const selectedDate = useFittingStore((state) => state.selectedDate);
  const workingHours = useWorkingHoursStore((state) => state.workingHours);
  const fetchFittingSchedules = useFittingStore(
    (state) => state.fetchFittingSchedules,
  );
  const fittingSchedules = useFittingStore((state) => state.fittingSchedules);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const earliestScheduleHour = 0;
  const latestScheduleHour = 23;

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
  weekEnd.setHours(23, 59, 59, 999);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const processedSchedules = useMemo(() => {
    return fittingSchedules.map((schedule): ICalendarEvent => {
      const firstName = schedule.user?.first_name || '';
      const lastName = schedule.user?.last_name || '';
      const customerName =
        `${firstName} ${lastName}`.trim() || 'Unknown Customer';

      return {
        ...schedule,
        title: customerName,
        color: getStatusColor(schedule.status),
        type: 'fitting', 
        originalData: schedule,
      };
    });
  }, [fittingSchedules]);

  const weekSchedules = processedSchedules.filter(
    (schedule) =>
      schedule.startTime >= weekStart && schedule.startTime <= weekEnd,
  );

  useEffect(() => {
    const weekStart = startOfWeek(selectedDate);
    const weekEnd = endOfWeek(selectedDate);

    fetchFittingSchedules(
      format(weekStart, 'yyyy-MM-dd'),
      format(weekEnd, 'yyyy-MM-dd'),
    );
  }, [selectedDate, fetchFittingSchedules]);

  return (
    <>
      <div className="flex flex-col items-center justify-center border-b py-4 text-sm text-muted-foreground sm:hidden ">
        <p>Weekly view is not available on smaller devices.</p>
        <p>Please switch to daily or monthly view.</p>
      </div>

      <div className="hidden flex-col sm:flex">
        <div>
          {/* Week header */}
          <div className="relative z-20 flex border-b">
            <div className="w-18"></div>
            <div className="grid flex-1 grid-cols-7 divide-x border-l">
              {weekDays.map((day, index) => (
                <span
                  key={index}
                  className="py-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {format(day, 'EE')}{' '}
                  <span className="ml-1 font-semibold text-foreground">
                    {format(day, 'd')}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <ScrollArea className="h-[736px]" type="always">
          <div className="flex overflow-hidden">
            {/* Hours column */}
            <div className="w-18 relative">
              {hours.map((hour, index) => (
                <div key={hour} className="relative" style={{ height: '96px' }}>
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Week grid */}
            <div className="relative flex-1 border-l">
              <div className="grid grid-cols-7 divide-x">
                {weekDays.map((day, dayIndex) => {
                  const daySchedule = weekSchedules.filter((schedule) => {
                    const scheduleStart = new Date(schedule.startTime);
                    const scheduleEnd = new Date(schedule.endTime);
                    const dayStart = startOfDay(day);
                    const dayEnd = endOfDay(day);

                    return areIntervalsOverlapping(
                      { start: scheduleStart, end: scheduleEnd },
                      { start: dayStart, end: dayEnd },
                    );
                  });
                  const groupedSchedule = groupSchedule(daySchedule);

                  return (
                    <div key={dayIndex} className="relative">
                      {hours.map((hour, index) => {
                        const isDisabled = !isWorkingHour(
                          day,
                          hour,
                          workingHours,
                        );

                        return (
                          <div
                            key={hour}
                            className={cn(
                              'relative',
                              isDisabled && 'bg-calendar-disabled-hour',
                            )}
                            style={{ height: '96px' }}
                          >
                            {index !== 0 && (
                              <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>
                            )}
                          </div>
                        );
                      })}

                      {groupedSchedule.map((group, groupIndex) =>
                        group.map((schedule) => {
                          let style = getScheduleBlockStyle(
                            schedule,
                            day,
                            groupIndex,
                            groupedSchedule.length,
                            {
                              from: earliestScheduleHour,
                              to: latestScheduleHour,
                            },
                          );
                          const hasOverlap = groupedSchedule.some(
                            (otherGroup, otherIndex) =>
                              otherIndex !== groupIndex &&
                              otherGroup.some((otherSchedule) =>
                                areIntervalsOverlapping(
                                  {
                                    start: schedule.startTime,
                                    end: schedule.endTime,
                                  },
                                  {
                                    start: otherSchedule.startTime,
                                    end: otherSchedule.endTime,
                                  },
                                ),
                              ),
                          );

                          if (!hasOverlap)
                            style = { ...style, width: '100%', left: '0%' };

                          return (
                            <div
                              key={schedule.id}
                              className="absolute p-1"
                              style={style}
                            >
                              <EventBlock schedule={schedule} />
                            </div>
                          );
                        }),
                      )}
                    </div>
                  );
                })}
              </div>

              <CalendarTimeline
                firstVisibleHour={earliestScheduleHour}
                lastVisibleHour={latestScheduleHour}
              />
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
