import { Calendar1, Clock, User } from 'lucide-react';
import { parseISO, areIntervalsOverlapping, format } from 'date-fns';
import { useCalendar } from 'contexts/calendar-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { EventBlock } from 'components/admin/fitting/calendar/week-and-day-view/event-block';
import { CalendarTimeline } from 'components/admin/fitting/calendar/week-and-day-view/calendar-time-line';
import { cn } from '@/lib/utils';
import {
  groupSchedule,
  getScheduleBlockStyle,
  isWorkingHour,
  getCurrentSchedule,
  getVisibleHours,
} from 'utils/helpers';
import type { IFittingSchedule } from 'types/fitting';

interface IProps {
  singleDaySchedule: IFittingSchedule[];
}

export function CalendarDayView({ singleDaySchedule}: IProps) {
  const { selectedDate, setSelectedDate, users, visibleHours, workingHours } =
    useCalendar();

  const { hours, earliestScheduleHour, latestScheduleHour } = getVisibleHours(
    visibleHours,
    singleDaySchedule
  );

  const currentSchedule = getCurrentSchedule(singleDaySchedule);

  const daySchedule = singleDaySchedule.filter((schedule) => {
    const scheduleDate = schedule.startTime;
    return (
      scheduleDate.getDate() === selectedDate.getDate() &&
      scheduleDate.getMonth() === selectedDate.getMonth() &&
      scheduleDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const groupedSchedule = groupSchedule(daySchedule);

  return (
    <div className="flex">
      <div className="flex flex-1 flex-col">
        <div>
          {/* Day header */}
          <div className="relative z-20 flex border-b">
            <div className="w-18"></div>
            <span className="flex-1 border-l py-2 text-center text-xs font-medium text-muted-foreground">
              {format(selectedDate, 'EE')}{' '}
              <span className="font-semibold text-foreground">
                {format(selectedDate, 'd')}
              </span>
            </span>
          </div>
        </div>

        <ScrollArea className="h-[800px]" type="always">
          <div className="flex">
            {/* Hours column */}
            <div className="w-18 relative">
              {hours.map((hour, index) => (
                <div key={hour} className="relative" style={{ height: '96px' }}>
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date().setHours(hour, 0, 0, 0), 'hh a')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="relative flex-1 border-l">
              <div className="relative">
                {hours.map((hour, index) => {
                  const isDisabled = !isWorkingHour(
                    selectedDate,
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
                      selectedDate,
                      groupIndex,
                      groupedSchedule.length,
                      { from: earliestScheduleHour, to: latestScheduleHour },
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
                        <EventBlock schedule={schedule[0]} />
                      </div>
                    );
                  }),
                )}
              </div>

              <CalendarTimeline
                firstVisibleHour={earliestScheduleHour}
                lastVisibleHour={latestScheduleHour}
              />
            </div>
          </div>
        </ScrollArea>
      </div>

      <div>
        <Calendar
          className="rounded-lg border"
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
        />

        <div className="flex-1 space-y-3">
          {currentSchedule.length > 0 ? (
            <div className="flex items-start gap-2 px-4 pt-4">
              <span className="relative mt-[5px] flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex size-2.5 rounded-full bg-green-600"></span>
              </span>

              <p className="text-sm font-semibold text-foreground">
                Happening now
              </p>
            </div>
          ) : (
            <p className="p-4 text-center text-sm italic text-muted-foreground">
              No appointments or consultations at the moment
            </p>
          )}

          {currentSchedule.length > 0 && (
            <ScrollArea className="h-[422px] px-4" type="always">
              <div className="space-y-6 pb-4">
                {currentSchedule.map((schedule) => {
                  const user = users.find(
                    (user) => user.id === schedule.user.id,
                  );

                  return (
                    <div key={schedule.id} className="space-y-1.5">
                      <p className="line-clamp-2 text-sm font-semibold">
                        {schedule.title}
                      </p>

                      {user && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="size-3.5" />
                          <span className="text-sm">{user.first_name}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar1 className="size-3.5" />
                        <span className="text-sm">
                          {format(new Date(), 'MMM d, yyyy')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3.5" />
                        <span className="text-sm">
                          {format(schedule.startTime, 'h:mm a')} -{' '}
                          {format(schedule.endTime, 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
