import {
  addDays,
  addMonths,
  addWeeks,
  subDays,
  subMonths,
  subWeeks,
  isSameWeek,
  isSameDay,
  isSameMonth,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  differenceInMinutes,
  eachDayOfInterval,
  startOfDay,
  differenceInDays,
  endOfYear,
  startOfYear,
  subYears,
  addYears,
  isSameYear,
  isWithinInterval,
} from 'date-fns';
import type { ICalendarCell, IFittingSchedule } from 'types/fitting';
import type {
  TCalendarView,
  TVisibleHours,
  TWorkingHours,
  TEventColor,
  FittingStatus
} from 'types/fitting';

// ================ Header helper functions ================ //

export function rangeText(view: TCalendarView, date: Date) {
  const formatString = 'MMM d, yyyy';
  let start: Date;
  let end: Date;

  switch (view) {
    case 'agenda':
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case 'year':
      start = startOfYear(date);
      end = endOfYear(date);
      break;
    case 'month':
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case 'week':
      start = startOfWeek(date);
      end = endOfWeek(date);
      break;
    case 'day':
      return format(date, formatString);
    default:
      return 'Error while formatting ';
  }

  return `${format(start, formatString)} - ${format(end, formatString)}`;
}

export function navigateDate(
  date: Date,
  view: TCalendarView,
  direction: 'previous' | 'next',
): Date {
  const operations = {
    agenda: direction === 'next' ? addMonths : subMonths,
    year: direction === 'next' ? addYears : subYears,
    month: direction === 'next' ? addMonths : subMonths,
    week: direction === 'next' ? addWeeks : subWeeks,
    day: direction === 'next' ? addDays : subDays,
  };

  return operations[view](date, 1);
}

export function getScheduleCount(
  schedule: IFittingSchedule[],
  date: Date,
  view: TCalendarView,
): number {
  const compareFns = {
    agenda: isSameMonth,
    year: isSameYear,
    day: isSameDay,
    week: isSameWeek,
    month: isSameMonth,
  };

  return schedule.filter((schedule) =>
    compareFns[view](new Date(schedule.startTime), date),
  ).length;
}

// ================ Week and day view helper functions ================ //

export function getCurrentSchedule(schedule: IFittingSchedule[]) {
  const now = new Date();
  return (
    schedule.filter((schedule) =>
      isWithinInterval(now, {
        start: schedule.startTime,
        end: schedule.endTime,
      }),
    ) || null
  );
}

export function groupSchedule(daySchedule: IFittingSchedule[]) {
  const sortedSchedule = daySchedule.sort(
    (a, b) => parseISO(a.startTime.toISOString()).getTime() - parseISO(b.startTime.toISOString()).getTime(),
  );
  const groups: IFittingSchedule[][] = [];

  for (const schedule of sortedSchedule) {
    const scheduleStart = schedule.startTime;

    let placed = false;
    for (const group of groups) {
      const lastScheduleInGroup = group[group.length - 1];
      const lastScheduleEnd = parseISO(lastScheduleInGroup.endTime.toISOString());

      if (scheduleStart >= lastScheduleEnd) {
        group.push(schedule);
        placed = true;
        break;
      }
    }

    if (!placed) groups.push([schedule]);
  }

  return groups;
}

export function getScheduleBlockStyle(
  schedule: IFittingSchedule,
  day: Date,
  groupIndex: number,
  groupSize: number,
  visibleHoursRange?: { from: number; to: number },
) {
  const startTime = schedule.startTime;
  const dayStart = new Date(day.setHours(0, 0, 0, 0));
  const scheduleStart = startTime < dayStart ? dayStart : startTime;
  const startMinutes = differenceInMinutes(scheduleStart, dayStart);

  let top;

  if (visibleHoursRange) {
    const visibleStartMinutes = visibleHoursRange.from * 60;
    const visibleEndMinutes = visibleHoursRange.to * 60;
    const visibleRangeMinutes = visibleEndMinutes - visibleStartMinutes;
    top = ((startMinutes - visibleStartMinutes) / visibleRangeMinutes) * 100;
  } else {
    top = (startMinutes / 1440) * 100;
  }

  const width = 100 / groupSize;
  const left = groupIndex * width;

  return { top: `${top}%`, width: `${width}%`, left: `${left}%` };
}

export function isWorkingHour(
  day: Date,
  hour: number,
  workingHours: TWorkingHours,
) {
  const dayIndex = day.getDay() as keyof typeof workingHours;
  const dayHours = workingHours[dayIndex];
  return hour >= dayHours.from && hour < dayHours.to;
}

export function getVisibleHours(
  visibleHours: TVisibleHours,
  singleDaySchedule: IFittingSchedule[],
) {
  let earliestScheduleHour = visibleHours.from;
  let latestScheduleHour = visibleHours.to;

  singleDaySchedule.forEach((schedule) => {
    const startHour = schedule.startTime.getHours();
    const endTime = schedule.endTime;
    const endHour = endTime.getHours() + (endTime.getMinutes() > 0 ? 1 : 0);
    if (startHour < earliestScheduleHour) earliestScheduleHour = startHour;
    if (endHour > latestScheduleHour) latestScheduleHour = endHour;
  });

  latestScheduleHour = Math.min(latestScheduleHour, 24);

  const hours = Array.from(
    { length: latestScheduleHour - earliestScheduleHour },
    (_, i) => i + earliestScheduleHour,
  );

  return { hours, earliestScheduleHour, latestScheduleHour };
}

// ================ Month view helper functions ================ //

export function getCalendarCells(selectedDate: Date): ICalendarCell[] {
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);
  const totalDays = firstDayOfMonth + daysInMonth;

  const prevMonthCells = Array.from({ length: firstDayOfMonth }, (_, i) => ({
    day: daysInPrevMonth - firstDayOfMonth + i + 1,
    currentMonth: false,
    date: new Date(
      currentYear,
      currentMonth - 1,
      daysInPrevMonth - firstDayOfMonth + i + 1,
    ),
  }));

  const currentMonthCells = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    currentMonth: true,
    date: new Date(currentYear, currentMonth, i + 1),
  }));

  const nextMonthCells = Array.from(
    { length: (7 - (totalDays % 7)) % 7 },
    (_, i) => ({
      day: i + 1,
      currentMonth: false,
      date: new Date(currentYear, currentMonth + 1, i + 1),
    }),
  );

  return [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];
}

export function calculateMonthSchedulePositions(
  multiDaySchedule: IFittingSchedule[],
  singleDaySchedule: IFittingSchedule[],
  selectedDate: Date,
) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const schedulePositions: { [key: string]: number } = {};
  const occupiedPositions: { [key: string]: boolean[] } = {};

  eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach((day) => {
    occupiedPositions[day.toISOString()] = [false, false, false];
  });

  const sortedSchedule = [
    ...multiDaySchedule.sort((a, b) => {
      const aDuration = differenceInDays(
        parseISO(a.endTime.toISOString()),
        parseISO(a.startTime.toISOString()),
      );
      const bDuration = differenceInDays(
        parseISO(b.endTime.toISOString()),
        parseISO(b.startTime.toISOString()),
      );
      return (
        bDuration - aDuration ||
        parseISO(a.startTime.toISOString()).getTime() -
          parseISO(b.startTime.toISOString()).getTime()
      );
    }),
    ...singleDaySchedule.sort(
      (a, b) =>
        parseISO(a.startTime.toISOString()).getTime() -
        parseISO(b.startTime.toISOString()).getTime(),
    ),
  ];

  sortedSchedule.forEach((schedule) => {
    const scheduleStart = schedule.startTime;
    const scheduleEnd = schedule.endTime;
    const scheduleDays = eachDayOfInterval({
      start: scheduleStart < monthStart ? monthStart : scheduleStart,
      end: scheduleEnd > monthEnd ? monthEnd : scheduleEnd,
    });

    let position = -1;

    for (let i = 0; i < 3; i++) {
      if (
        scheduleDays.every((day) => {
          const dayPositions = occupiedPositions[startOfDay(day).toISOString()];
          return dayPositions && !dayPositions[i];
        })
      ) {
        position = i;
        break;
      }
    }

    if (position !== -1) {
      scheduleDays.forEach((day) => {
        const dayKey = startOfDay(day).toISOString();
        occupiedPositions[dayKey][position] = true;
      });
      schedulePositions[schedule.id] = position;
    }
  });

  return schedulePositions;
}

export function getMonthCellSchedule(
  date: Date,
  schedule: IFittingSchedule[],
  schedulePositions: Record<string, number>,
) {
  const scheduleForDate = schedule.filter((schedule) => {
    const scheduleStart = schedule.startTime;
    const scheduleEnd = schedule.endTime;
    return (
      (date >= scheduleStart && date <= scheduleEnd) ||
      isSameDay(date, scheduleStart) ||
      isSameDay(date, scheduleEnd)
    );
  });

  return scheduleForDate
    .map((schedule) => ({
      ...schedule,
      position: schedulePositions[schedule.id] ?? -1,
      isMultiDay: schedule.startTime !== schedule.endTime,
    }))
    .sort((a, b) => {
      if (a.isMultiDay && !b.isMultiDay) return -1;
      if (!a.isMultiDay && b.isMultiDay) return 1;
      return a.position - b.position;
    });
}


const STATUS_COLOR_MAP: Record<FittingStatus, TEventColor> = {
  CONFIRMED: 'green',
  CANCELED: 'red',
  COMPLETED: 'blue',
  PENDING: 'yellow',
  REJECTED: 'gray',
};

export function getStatusColor(status: FittingStatus): TEventColor {
  return STATUS_COLOR_MAP[status] ?? 'gray'; // fallback if status is somehow not mapped
}
