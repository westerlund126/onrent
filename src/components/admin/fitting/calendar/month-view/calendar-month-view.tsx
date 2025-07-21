// CalendarMonthView.tsx
import { useMemo, useEffect } from 'react';
import { DayCell } from 'components/admin/fitting/calendar/month-view/day-cell';
import {
  getCalendarCells,
  calculateMonthSchedulePositions,
  getStatusColor,
} from 'utils/helpers';
import type {
  IFittingSchedule,
  IScheduleBlock,
  ICalendarEvent,
} from 'types/fitting';
import { useFittingStore } from 'stores';
import { useScheduleStore } from 'stores/useScheduleStore'; 
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface IProps {
  singleDaySchedule: IFittingSchedule[];
}
const WEEK_DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function CalendarMonthView({ singleDaySchedule }: IProps) {
  const { selectedDate } = useFittingStore();

  // Add schedule store
  const { scheduleBlocks, fetchScheduleBlocks } = useScheduleStore();

  const {
    fittingSchedules,
    fittingSlots,
    isLoading,
    error,
    fetchFittingSchedules,
    fetchFittingSlots,
  } = useFittingStore();

  const monthStart = useMemo(() => startOfMonth(selectedDate), [selectedDate]);
  const monthEnd = useMemo(() => endOfMonth(selectedDate), [selectedDate]);

  useEffect(() => {
    const dateFrom = format(monthStart, 'yyyy-MM-dd');
    const dateTo = format(monthEnd, 'yyyy-MM-dd');

    fetchFittingSchedules(dateFrom, dateTo);
    fetchFittingSlots(dateFrom, dateTo);
    // Add schedule blocks fetching
    fetchScheduleBlocks(dateFrom, dateTo);
    console.log('Fetching data from:', dateFrom, 'to:', dateTo);
  }, [
    monthStart,
    monthEnd,
    fetchFittingSchedules,
    fetchFittingSlots,
    fetchScheduleBlocks,
  ]);

  const processedSingleDaySchedule = useMemo(() => {
    return singleDaySchedule.map((schedule) => ({
      ...schedule,
      title: schedule.user
        ? [schedule.user.first_name, schedule.user.last_name]
            .filter(Boolean)
            .join(' ') || 'Unknown Customer'
        : 'Unknown Customer',
      color: getStatusColor(schedule.status),
    }));
  }, [singleDaySchedule]);

  const processedSchedule = useMemo(() => {
    const schedule: IFittingSchedule[] = [];

    if (!Array.isArray(fittingSchedules) || !Array.isArray(fittingSlots)) {
      return [];
    }

    fittingSchedules.forEach((fittingSchedule) => {
      const slot = fittingSlots.find(
        (s) => s.id === fittingSchedule.fittingSlotId,
      );

      if (slot) {
        const startDateTime = new Date(slot.dateTime);
        const endDateTime = new Date(
          startDateTime.getTime() + fittingSchedule.duration * 60000,
        );

        const customerName = fittingSchedule.user
          ? `${fittingSchedule.user.first_name} ${fittingSchedule.user.last_name}`.trim()
          : 'Unknown Customer';

        schedule.push({
          ...fittingSchedule,
          startTime: startDateTime,
          endTime: endDateTime,
          title: `${customerName}`,
          color: getStatusColor(fittingSchedule.status),
          note: fittingSchedule.note || 'No additional notes',
          fittingSlot: slot,
        });
      }
    });

    const singleDay: IFittingSchedule[] = [];

    schedule.forEach((scheduleItem) => {
      const startDate = scheduleItem.startTime.toISOString().split('T')[0];
      const endDate = scheduleItem.endTime.toISOString().split('T')[0];

      if (startDate === endDate) {
        singleDay.push(scheduleItem);
      }
    });

    return singleDay;
  }, [fittingSchedules, fittingSlots]);

  const processedScheduleBlocks = useMemo(() => {
    if (!Array.isArray(scheduleBlocks)) {
      return [];
    }

    return scheduleBlocks.map(
      (block): ICalendarEvent => ({
        id: `block-${block.id}`,
        startTime: new Date(block.startTime),
        endTime: new Date(block.endTime),
        title: block.description || 'Blocked Time',
        color: 'gray', 
        type: 'block',
        originalData: block,
      }),
    );
  }, [scheduleBlocks]);

  const allSchedule = useMemo(() => {
    const fittingEvents: ICalendarEvent[] = [
      ...processedSingleDaySchedule,
      ...processedSchedule,
    ].map((schedule) => ({
      id: schedule.id,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      title: schedule.title,
      color: schedule.color,
      type: 'fitting' as const,
      originalData: schedule,
    }));

    return [...fittingEvents, ...processedScheduleBlocks];
  }, [processedSingleDaySchedule, processedSchedule, processedScheduleBlocks]);

  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

  const schedulePositions = useMemo(
    () => calculateMonthSchedulePositions(allSchedule, selectedDate),
    [allSchedule, selectedDate],
  );

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Error loading calendar: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-7 divide-x">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="flex items-center justify-center py-2">
            <span className="text-xs font-medium text-muted-foreground">
              {day}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 overflow-hidden">
        {cells.map((cell) => (
          <DayCell
            key={cell.date.toISOString()}
            cell={cell}
            schedule={allSchedule}
            schedulePositions={schedulePositions}
          />
        ))}
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div>Loading...</div>
        </div>
      )}
    </div>
  );
}
