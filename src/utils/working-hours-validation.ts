// utils/working-hours-validation.ts

import {
  WorkingHours,
  DayWorkingHours,
  WorkingHoursValidationResult,
  WorkingHoursValidationError,
  VALID_DAY_INDICES,
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

/**
 * Validates if a number is a valid day index (0-6)
 */
export function isValidDayIndex(dayIndex: any): dayIndex is ValidDayIndex {
  return (
    typeof dayIndex === 'number' &&
    dayIndex >= 0 &&
    dayIndex <= 6 &&
    Number.isInteger(dayIndex)
  );
}

/**
 * Checks if a day is set to open.
 */
export function isDayEnabled(day: DayWorkingHours): boolean {
 return day.from > 0 || day.to > 0;
}

function getDayName(dayIndex: ValidDayIndex): string {
    const dayNames = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ];
    return dayNames[dayIndex];
}

// ⭐ ADDED BACK: The missing validation functions
/**
 * Validates a single day's working hours
 */
export function validateDayWorkingHours(
  day: any,
  dayName: string,
): WorkingHoursValidationError[] {
  const errors: WorkingHoursValidationError[] = [];

  if (!day || typeof day !== 'object') {
    errors.push({ field: `${dayName}`, message: 'Day working hours must be an object', value: day });
    return errors;
  }

  if (!isValidHour(day.from)) {
    errors.push({ field: `${dayName}.from`, message: 'From hour must be a number between 0 and 23', value: day.from });
  }

  if (!isValidHour(day.to)) {
    errors.push({ field: `${dayName}.to`, message: 'To hour must be a number between 0 and 23', value: day.to });
  }

  if (isValidHour(day.from) && isValidHour(day.to)) {
    const isEnabled = day.from > 0 || day.to > 0;
    if (isEnabled && day.from === day.to && day.from !== 0) {
      errors.push({
        field: `${dayName}`,
        message: 'From and to hours cannot be the same (except for closed days)',
        value: { from: day.from, to: day.to },
      });
    }
  }
  return errors;
}

/**
 * Validates the entire working hours structure
 */
export function validateWorkingHours(
  workingHours: any,
): WorkingHoursValidationResult {
  const errors: WorkingHoursValidationError[] = [];

  if (!workingHours || typeof workingHours !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'workingHours', message: 'Working hours must be an object', value: workingHours }],
    };
  }

  for (const dayIndex of VALID_DAY_INDICES) {
    const dayName = getDayName(dayIndex);
    if (!(dayIndex in workingHours)) {
      errors.push({ field: `workingHours[${dayIndex}]`, message: `Missing working hours for ${dayName}`, value: undefined });
      continue;
    }
    const dayErrors = validateDayWorkingHours(workingHours[dayIndex], `${dayName} (${dayIndex})`);
    errors.push(...dayErrors);
  }

  for (const key in workingHours) {
    const dayIndex = parseInt(key);
    if (!isValidDayIndex(dayIndex)) {
      errors.push({ field: `workingHours[${key}]`, message: 'Invalid day index. Must be 0-6 (Sunday-Saturday)', value: dayIndex });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes working hours by ensuring all values are within valid ranges
 */
export function sanitizeWorkingHours(workingHours: any): WorkingHours {
  const sanitized: Partial<WorkingHours> = {};
  for (const dayIndex of VALID_DAY_INDICES) {
    const day = workingHours?.[dayIndex];
    if (day && typeof day === 'object') {
      const from = isValidHour(day.from) ? day.from : 0;
      const to = isValidHour(day.to) ? day.to : 0;
      sanitized[dayIndex] = { from, to };
    } else {
      sanitized[dayIndex] = { from: 0, to: 0 };
    }
  }
  return sanitized as WorkingHours;
}


// ⭐ TIMEZONE CONVERSION LOGIC WITH LOGGING
/**
 * Converts a WIB hour (from UI) into a UTC Date object (for DB).
 */
export function formatHourToTime(hour: number): Date {
  console.log(`[➡️ formatHourToTime] Input WIB Hour (from UI): ${hour}`);
  if (!isValidHour(hour) || hour === 0) {
    const closedDate = new Date('1970-01-01T00:00:00.000Z');
    console.log(`[➡️ formatHourToTime] Day is closed (0). Returning UTC Date: ${closedDate.toISOString()}`);
    return closedDate;
  }
  const utcHour = (hour - WIB_OFFSET + 24) % 24;
  const date = new Date('1970-01-01T00:00:00.000Z');
  date.setUTCHours(utcHour);
  console.log(`[➡️ formatHourToTime] Calculated UTC Hour: ${utcHour}`);
  console.log(`[➡️ formatHourToTime] Output UTC Date (to DB): ${date.toISOString()}`);
  return date;
}

/**
 * Converts a UTC Date object (from DB) into a WIB hour (for UI).
 */
export function parseTimeToHour(timeValue: string | Date): number {
  console.log(`[⬅️ parseTimeToHour] Input timeValue (from DB): ${timeValue} (Type: ${typeof timeValue})`);
  if (timeValue instanceof Date) {
    const utcHour = timeValue.getUTCHours();
    console.log(`[⬅️ parseTimeToHour] Extracted UTC Hour: ${utcHour}`);
    const wibHour = (utcHour + WIB_OFFSET) % 24;
    console.log(`[⬅️ parseTimeToHour] Calculated Output WIB Hour (to UI): ${wibHour}`);
    if (!isValidHour(wibHour)) { throw new Error(`Invalid calculated WIB hour: ${wibHour}`); }
    return wibHour;
  } else if (typeof timeValue === 'string') {
    const match = timeValue.match(/^(\d{1,2}):(\d{2})?.*$/);
    if (!match) { throw new Error(`Invalid time string format: ${timeValue}`); }
    const hour = parseInt(match[1], 10);
    console.log(`[⬅️ parseTimeToHour] WARNING: Received string input. Parsed hour: ${hour}`);
    if (!isValidHour(hour)) { throw new Error(`Invalid hour in string: ${hour}`); }
    return hour;
  } else {
    throw new Error('Time value must be a string or Date object');
  }
}

// ⭐ DATABASE TRANSFORMATION FUNCTIONS
export function transformToDatabaseFormat(
  workingHours: WorkingHours,
  ownerId: number,
) {
  console.log("[🔄 transformToDatabaseFormat] Starting transformation to DB format (WIB -> UTC)");
  const weeklySlots = [];
  for (const dayIndex of VALID_DAY_INDICES) {
    const dayHours = workingHours[dayIndex];
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
  for (const dayIndex of VALID_DAY_INDICES) {
    workingHours[dayIndex] = { from: 0, to: 0 };
  }
  weeklySlots.forEach((slot) => {
    const dayIndex = DAY_ENUM_TO_NUMBER[slot.dayOfWeek as keyof typeof DAY_ENUM_TO_NUMBER];
    console.log(`[🔄 Processing Slot: ${slot.dayOfWeek}] StartTime: ${slot.startTime}, EndTime: ${slot.endTime}`);
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