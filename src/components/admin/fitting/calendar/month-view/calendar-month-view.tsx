// CalendarMonthView.tsx
import { useMemo, useEffect } from 'react';
import { DayCell } from 'components/admin/fitting/calendar/month-view/day-cell';
import { getCalendarCells, calculateMonthSchedulePositions } from 'utils/helpers';
import type { IFittingSchedule } from 'types/fitting';
import { useCalendarStore } from 'stores/useCalendarStore';
import { useFittingStore } from 'stores';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface IProps {
  ownerId?: number;
  singleDaySchedule: IFittingSchedule[];
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarMonthView({ ownerId }: IProps) {
  const { selectedDate, selectedUserId, visibleHours } = useCalendarStore();

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

    const userIdToFetch =
      selectedUserId !== 'all' ? Number(selectedUserId) : ownerId;

    fetchFittingSchedules(userIdToFetch);
    fetchFittingSlots(userIdToFetch, dateFrom, dateTo);
  }, [
    monthStart,
    monthEnd,
    ownerId,
    selectedUserId,
    fetchFittingSchedules,
    fetchFittingSlots,
  ]);

  const { singleDaySchedule, multiDaySchedule } = useMemo(() => {
    const schedule: IFittingSchedule[] = []; 

    fittingSchedules.forEach((fittingSchedule) => {
      const slot = fittingSlots.find(
        (s) => s.id === fittingSchedule.fittingSlotId,
      );
      if (slot) {
        if (
          selectedUserId !== 'all' &&
          fittingSchedule.userId.toString() !== selectedUserId
        ) {
          return;
        }

        const startDateTime = new Date(slot.dateTime);
        const endDateTime = new Date(
          startDateTime.getTime() + fittingSchedule.duration * 60000,
        );

        schedule.push({
          ...fittingSchedule,
          startTime: startDateTime,
          endTime: endDateTime,
          title: fittingSchedule.title || 'Fitting Appointment', // Fixed: use note instead of [0]?.description
          color:
            fittingSchedule.status === 'CONFIRMED'
              ? 'green'
              : fittingSchedule.status === 'CANCELED'
              ? 'red'
              : fittingSchedule.status === 'COMPLETED'
              ? 'blue'
              : 'yellow',
          note: fittingSchedule.note || 'No additional notes',
          fittingSlot: slot, // Add the slot reference
        });
      }
    });

    // For available slots, you'll need to create IFittingSchedule objects
    // This might not be the best approach - consider creating a separate interface for available slots
    fittingSlots
      .filter((slot) => !slot.isBooked)
      .forEach((slot) => {
        const startDateTime = new Date(slot.dateTime);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60000); 

        schedule.push({
          id: slot.id,
          userId: slot.ownerId,
          fittingSlotId: slot.id,
          duration: 60,
          startTime: startDateTime,
          endTime: endDateTime,
          title: 'Available Slot',
          color: 'gray',
          note: slot.isAutoConfirm
            ? 'Auto-confirm enabled'
            : 'Manual confirmation required',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'PENDING' as const,
          user: slot.owner,
          fittingSlot: slot,
          FittingProduct: [],
        });
      });

    const singleDay: IFittingSchedule[] = [];
    const multiDay: IFittingSchedule[] = [];

    schedule.forEach((scheduleItem) => {
      const startDate = scheduleItem.startTime.toISOString().split('T')[0];
      const endDate = scheduleItem.endTime.toISOString().split('T')[0];

      if (startDate === endDate) {
        singleDay.push(scheduleItem);
      } else {
        multiDay.push(scheduleItem);
      }
    });

    return { singleDaySchedule: singleDay, multiDaySchedule: multiDay };
  }, [fittingSchedules, fittingSlots, selectedUserId]);

  const allSchedule = [ ...multiDaySchedule, ...singleDaySchedule];

  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

  const schedulePositions = useMemo(
    () =>
      calculateMonthSchedulePositions(
        multiDaySchedule,
        singleDaySchedule,
        selectedDate,
      ),
    [multiDaySchedule, singleDaySchedule, selectedDate],
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
