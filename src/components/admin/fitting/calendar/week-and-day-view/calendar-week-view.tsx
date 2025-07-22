// calendar-week-view.tsx

import {
  startOfWeek,
  addDays,
  format,
  areIntervalsOverlapping,
  endOfWeek,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { useMemo, useEffect } from 'react';
import { XCircle, Clock } from 'lucide-react'; 
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFittingStore } from 'stores';
import { useWorkingHoursStore } from 'stores/useWorkingHoursStore';
import { useScheduleStore } from 'stores/useScheduleStore'; 
import { EventBlock } from 'components/admin/fitting/calendar/week-and-day-view/event-block';
import { CalendarTimeline } from 'components/admin/fitting/calendar/week-and-day-view/calendar-time-line';
import { cn } from '@/lib/utils';
import {
  groupSchedule,
  getScheduleBlockStyle,
  isWorkingHour,
  getStatusColor,
  transformFittingScheduleToCalendarEvent,
} from 'utils/helpers';
import type { ICalendarEvent } from 'types/fitting';

export function CalendarWeekView() {
  const selectedDate = useFittingStore((state) => state.selectedDate);
  const fittingSchedules = useFittingStore((state) => state.fittingSchedules);
  const fetchFittingSchedules = useFittingStore(
    (state) => state.fetchFittingSchedules,
  );
  const workingHours = useWorkingHoursStore((state) => state.workingHours);

  const { scheduleBlocks, fetchScheduleBlocks } = useScheduleStore();

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const earliestScheduleHour = 0;
  const latestScheduleHour = 23;

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [selectedDate]);

  useEffect(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });

    const from = format(weekStart, 'yyyy-MM-dd');
    const to = format(weekEnd, 'yyyy-MM-dd');

    fetchFittingSchedules(from, to);
    fetchScheduleBlocks(from, to);
  }, [selectedDate, fetchFittingSchedules, fetchScheduleBlocks]);

  const fittingEvents = useMemo(() => {
    return fittingSchedules.map((schedule) => {
      const firstName = schedule.user?.first_name || '';
      const lastName = schedule.user?.last_name || '';
      const customerName =
        `${firstName} ${lastName}`.trim() || 'Unknown Customer';

      return transformFittingScheduleToCalendarEvent({
        ...schedule,
        title: customerName,
        color: getStatusColor(schedule.status),
      });
    });
  }, [fittingSchedules]);

  const blockEvents = useMemo(() => {
    if (!Array.isArray(scheduleBlocks)) return [];

    return scheduleBlocks.map(
      (block): ICalendarEvent => ({
        id: `block-${block.id}`,
        startTime: new Date(block.startTime),
        endTime: new Date(block.endTime),
        title: block.description || 'Blocked Off',
        color: 'gray',
        type: 'block',
        originalData: block,
      }),
    );
  }, [scheduleBlocks]);

  // 6. Combine all events into a single array for the week
  const allWeekEvents = useMemo(() => {
    return [...fittingEvents, ...blockEvents];
  }, [fittingEvents, blockEvents]);

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
                  // Filter all events for the current day of the week
                  const daySchedule = allWeekEvents.filter((event) => {
                    const eventStart = event.startTime;
                    const dayStart = startOfDay(day);
                    const dayEnd = endOfDay(day);
                    return areIntervalsOverlapping(
                      { start: eventStart, end: event.endTime },
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

                      {/* 7. Render events with conditional logic */}
                      {groupedSchedule.map((group, groupIndex) =>
                        group.map((event) => {
                          let style = getScheduleBlockStyle(
                            event,
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
                              otherGroup.some((otherEvent) =>
                                areIntervalsOverlapping(
                                  {
                                    start: event.startTime,
                                    end: event.endTime,
                                  },
                                  {
                                    start: otherEvent.startTime,
                                    end: otherEvent.endTime,
                                  },
                                ),
                              ),
                          );

                          if (!hasOverlap)
                            style = { ...style, width: '100%', left: '0%' };

                          return (
                            <div
                              key={event.id}
                              className="absolute p-1"
                              style={style}
                            >
                              {event.type === 'fitting' ? (
                                <EventBlock schedule={event} />
                              ) : (
                                <div className="flex h-full items-start gap-2 rounded-lg bg-muted p-2 text-muted-foreground">
                                  <XCircle className="mt-0.5 size-4 flex-shrink-0" />
                                  <div className="flex flex-col">
                                    <p className="font-semibold">
                                      {event.title}
                                    </p>
                                    <p className="text-xs">
                                      {format(event.startTime, 'HH:mm')} -{' '}
                                      {format(event.endTime, 'HH:mm')}
                                    </p>
                                  </div>
                                </div>
                              )}
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
