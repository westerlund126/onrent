// utils/working-hours-validation.ts

import {
  WorkingHours,
  DayWorkingHours,
  WorkingHoursValidationResult,
  WorkingHoursValidationError,
  VALID_DAY_INDICES,
  VALID_HOURS,
  ValidDayIndex,
  ValidHour,
} from 'types/working-hours';

const DAY_NUMBER_TO_ENUM = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
} as const;

const DAY_ENUM_TO_NUMBER = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

const WIB_OFFSET = 7; // Western Indonesian Time is UTC+7

/**
 * Validates if a number is a valid hour (0-23)
 */
export function isValidHour(hour: any): hour is ValidHour {
  return (
    typeof hour === 'number' &&
    Number.isInteger(hour) &&
    hour >= 0 &&
    hour <= 23
  );
}

// ⭐ ADDED BACK: This function was missing.
/**
 * Validates if a number is a valid day index (0-6)
 */
export function isValidDayIndex(dayIndex: any): dayIndex is ValidDayIndex {
  // Assuming VALID_DAY_INDICES is [0, 1, 2, 3, 4, 5, 6]
  return (
    typeof dayIndex === 'number' &&
    dayIndex >= 0 &&
    dayIndex <= 6 &&
    Number.isInteger(dayIndex)
  );
}


// ⭐ ADDED BACK: This function was missing.
export function isDayEnabled(day: DayWorkingHours): boolean {
 return day.from > 0 || day.to > 0;
}


// ⭐ UPDATED: Converts a WIB hour (from UI) into a UTC Date object (for DB storage).
export function formatHourToTime(hour: number): Date {
  // LOGGING START
  console.log(`[➡️ formatHourToTime] Input WIB Hour (from UI): ${hour}`);
  // LOGGING END

  if (!isValidHour(hour) || hour === 0) {
    const closedDate = new Date('1970-01-01T00:00:00.000Z');
     // LOGGING START
    console.log(`[➡️ formatHourToTime] Day is closed (0). Returning UTC Date: ${closedDate.toISOString()}`);
    // LOGGING END
    return closedDate;
  }

  // Convert the WIB hour to its UTC equivalent.
  // (hour - 7 + 24) % 24 handles negative results correctly (e.g., 06:00 WIB is 23:00 UTC previous day).
  const utcHour = (hour - WIB_OFFSET + 24) % 24;

  const date = new Date('1970-01-01T00:00:00.000Z');
  date.setUTCHours(utcHour);

  // LOGGING START
  console.log(`[➡️ formatHourToTime] Calculated UTC Hour: ${utcHour}`);
  console.log(`[➡️ formatHourToTime] Output UTC Date (to DB): ${date.toISOString()}`);
  // LOGGING END

  return date;
}

// ⭐ UPDATED: Converts a UTC Date object (from DB) into a WIB hour (for UI display).
export function parseTimeToHour(timeValue: string | Date): number {
  // LOGGING START
  console.log(`[⬅️ parseTimeToHour] Input timeValue (from DB): ${timeValue} (Type: ${typeof timeValue})`);
  // LOGGING END

  if (timeValue instanceof Date) {
    // Get the hour from the Date object in UTC.
    const utcHour = timeValue.getUTCHours();
    
    // LOGGING START
    console.log(`[⬅️ parseTimeToHour] Extracted UTC Hour: ${utcHour}`);
    // LOGGING END
    
    // Convert the UTC hour to its WIB equivalent.
    const wibHour = (utcHour + WIB_OFFSET) % 24;
    
    // LOGGING START
    console.log(`[⬅️ parseTimeToHour] Calculated Output WIB Hour (to UI): ${wibHour}`);
    // LOGGING END

    if (!isValidHour(wibHour)) {
        throw new Error(`Invalid calculated WIB hour: ${wibHour}`);
    }
    return wibHour;

  } else if (typeof timeValue === 'string') {
    // This handles string-based times if Prisma returns strings (less common for DateTime).
    // We assume the string is in HH:mm format.
    const match = timeValue.match(/^(\d{1,2}):(\d{2})?.*$/);
    if (!match) throw new Error(`Invalid time string format: ${timeValue}`);
    
    const hour = parseInt(match[1], 10);
    
    // LOGGING START
    // If this log appears, it means Prisma returned a string, which might indicate a different issue.
    console.log(`[⬅️ parseTimeToHour] WARNING: Received string input. Parsed hour: ${hour}`);
    // LOGGING END

    if (!isValidHour(hour)) throw new Error(`Invalid hour in string: ${hour}`);
    return hour;
  } else {
    throw new Error('Time value must be a string or Date object');
  }
}

function getDayName(dayIndex: ValidDayIndex): string {
    const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      return dayNames[dayIndex];
}


export function transformToDatabaseFormat(
  workingHours: WorkingHours,
  ownerId: number,
) {
  console.log("[🔄 transformToDatabaseFormat] Starting transformation to DB format (WIB -> UTC)");
  const weeklySlots = [];

  for (const dayIndex of VALID_DAY_INDICES) {
    const dayHours = workingHours[dayIndex];
    // This was the source of the first error.
    const isEnabled = isDayEnabled(dayHours);

    console.log(`[🔄 Processing Day Index: ${dayIndex}] From: ${dayHours.from}, To: ${dayHours.to}, isEnabled: ${isEnabled}`);

    weeklySlots.push({
      ownerId,
      dayOfWeek: DAY_NUMBER_TO_ENUM[dayIndex],
      isEnabled,
      startTime: formatHourToTime(dayHours.from),
      endTime: formatHourToTime(dayHours.to),
    });
  }
  console.log("[🔄 transformToDatabaseFormat] Finished transformation.");
  return weeklySlots;
}

export function transformFromDatabaseFormat(weeklySlots: any[]): WorkingHours {
  console.log("[🔄 transformFromDatabaseFormat] Starting transformation from DB format (UTC -> WIB)");
  const workingHours: Partial<WorkingHours> = {};

  // Initialize workingHours structure
  for (const dayIndex of VALID_DAY_INDICES) {
    workingHours[dayIndex] = { from: 0, to: 0 };
  }

  weeklySlots.forEach((slot) => {
    const dayIndex =
      DAY_ENUM_TO_NUMBER[slot.dayOfWeek as keyof typeof DAY_ENUM_TO_NUMBER];
    
    console.log(`[🔄 Processing Slot: ${slot.dayOfWeek}] StartTime: ${slot.startTime}, EndTime: ${slot.endTime}`);
    
    // This was the source of the second error.
    if (slot && isValidDayIndex(dayIndex) && slot.isEnabled) {
      try {
        const from = parseTimeToHour(slot.startTime);
        const to = parseTimeToHour(slot.endTime);
        workingHours[dayIndex] = { from, to };
      } catch (error) {
        console.error(`Error parsing slot for day ${slot.dayOfWeek}:`, error);
      }
    }
  });

  console.log("[🔄 transformFromDatabaseFormat] Finished transformation. Resulting WIB hours:", JSON.stringify(workingHours));
  return workingHours as WorkingHours;
}