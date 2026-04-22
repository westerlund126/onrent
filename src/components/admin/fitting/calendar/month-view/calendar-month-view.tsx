// CalendarMonthView.tsx
import { useMemo, useEffect, useState } from 'react';
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
  showInactiveSchedules?: boolean; // New prop to control whether to show inactive schedules
  defaultShowInactive?: boolean; // Default value for the internal state
}
const WEEK_DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function CalendarMonthView({ 
  singleDaySchedule, 
  showInactiveSchedules, // This can be controlled externally
  defaultShowInactive = true // Default to true to show all schedules
}: IProps) {
  const { selectedDate } = useFittingStore();

  // Internal state for controlling inactive schedules visibility
  const [internalShowInactive, setInternalShowInactive] = useState(defaultShowInactive);
  
  // Use external prop if provided, otherwise use internal state
  const shouldShowInactiveSchedules = showInactiveSchedules !== undefined 
    ? showInactiveSchedules 
    : internalShowInactive;

  const { scheduleBlocks, fetchScheduleBlocks } = useScheduleStore();

  const {
    fittingSchedules,
    fittingSlots,
    isLoading,
    error,
    fetchFittingSchedules,
    fetchFittingSlots,
    // Use the new helper functions from your store
    getActiveSchedules,
    getAllSchedules,
    getInactiveSchedules,
  } = useFittingStore();

  const monthStart = useMemo(() => startOfMonth(selectedDate), [selectedDate]);
  const monthEnd = useMemo(() => endOfMonth(selectedDate), [selectedDate]);

  useEffect(() => {
    const dateFrom = format(monthStart, 'yyyy-MM-dd');
    const dateTo = format(monthEnd, 'yyyy-MM-dd');

    // KEY CHANGE: Pass includeInactive=true to fetch all schedules including canceled/rejected ones
    fetchFittingSchedules(dateFrom, dateTo, true);
    fetchFittingSlots(dateFrom, dateTo);
    fetchScheduleBlocks(dateFrom, dateTo);
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

  // Use the helper functions from your store to get the right schedules
  const schedulesToShow = useMemo(() => {
    if (showInactiveSchedules) {
      return getAllSchedules(); // This will include both active and inactive schedules
    } else {
      return getActiveSchedules(); // This will only show active schedules
    }
  }, [showInactiveSchedules, getAllSchedules, getActiveSchedules]);

  const processedSchedule = useMemo(() => {
    const schedule: IFittingSchedule[] = [];

    if (!Array.isArray(schedulesToShow) || !Array.isArray(fittingSlots)) {
      return [];
    }

    schedulesToShow.forEach((fittingSchedule) => {
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
  }, [schedulesToShow, fittingSlots]); // Changed dependency from fittingSchedules to schedulesToShow

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
      {/* Optional: Add a toggle to show/hide inactive schedules */}
      {/* You can uncomment this if you want to give users control */}
      {/*
      <div className="mb-4 flex items-center gap-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showInactiveSchedules}
            onChange={(e) => setShowInactiveSchedules(e.target.checked)}
          />
          Show canceled/rejected schedules
        </label>
      </div>
      */}

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