import { useMemo } from "react";
import { isToday, startOfDay } from "date-fns";
import { EventBullet } from 'components/admin/fitting/calendar/month-view/event-bullet';
import { DroppableDayCell } from 'components/admin/fitting/calendar/dnd/droppable-day-cell';
import { MonthEventBadge } from 'components/admin/fitting/calendar/month-view/month-event-badge';

import { cn } from "@/lib/utils";
import { getMonthCellSchedule } from "utils/helpers";

import type { ICalendarCell, ICalendarEvent, IFittingSchedule } from 'types/fitting';

interface IProps {
  cell: ICalendarCell;
  schedule: ICalendarEvent[];
  schedulePositions: Record<string, number>;
}

const MAX_VISIBLE_EVENTS = 3;

export function DayCell({ cell, schedule, schedulePositions }: IProps) {
  const { day, currentMonth, date } = cell;

  const cellSchedule = useMemo(() => getMonthCellSchedule(date, schedule, schedulePositions), [date, schedule, schedulePositions]);

  const isSunday = date.getDay() === 0;

  return (
    <DroppableDayCell cell={cell}>
      <div className={cn("flex h-full flex-col gap-1 border-l border-t py-1.5 lg:py-2", isSunday && "border-l-0")}>
        <span
          className={cn(
            "h-6 px-1 text-xs font-semibold lg:px-2",
            !currentMonth && "opacity-20",
            isToday(date) && "flex w-6 translate-x-1 items-center justify-center rounded-full bg-primary px-0 font-bold text-primary-foreground"
          )}
        >
          {day}
        </span>

        <div className={cn("flex h-6 gap-1 px-2 lg:h-[94px] lg:flex-col lg:gap-2 lg:px-0", !currentMonth && "opacity-50")}>
          {[0, 1, 2].map(position => {
            const schedule = cellSchedule.find(e => e.position === position);
            const scheduleKey = schedule ? `schedule-${schedule.id}-${position}` : `empty-${position}`;

            return (
              <div key={scheduleKey} className="lg:flex-1">
                {schedule && (
                  <>
            
                    <EventBullet className="lg:hidden" color={schedule.color} />
                    <MonthEventBadge
                      className="hidden lg:flex"
                      schedule={schedule}
                      cellDate={startOfDay(date)}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {cellSchedule.length > MAX_VISIBLE_EVENTS && (
          <p className={cn("h-4.5 px-1.5 text-xs font-semibold text-muted-foreground", !currentMonth && "opacity-50")}>
            <span className="sm:hidden">+{cellSchedule.length - MAX_VISIBLE_EVENTS}</span>
            <span className="hidden sm:inline"> {cellSchedule.length - MAX_VISIBLE_EVENTS} lebih banyak...</span>
          </p>
        )}
      </div>
    </DroppableDayCell>
  );
}
