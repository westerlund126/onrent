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

// Day mapping constants
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
    VALID_DAY_INDICES.includes(dayIndex as ValidDayIndex)
  );
}

/**
 * Validates a single day's working hours
 */
export function validateDayWorkingHours(
  day: any,
  dayName: string,
): WorkingHoursValidationError[] {
  const errors: WorkingHoursValidationError[] = [];

  if (!day || typeof day !== 'object') {
    errors.push({
      field: `${dayName}`,
      message: 'Day working hours must be an object',
      value: day,
    });
    return errors;
  }

  if (!isValidHour(day.from)) {
    errors.push({
      field: `${dayName}.from`,
      message: 'From hour must be a number between 0 and 23',
      value: day.from,
    });
  }

  if (!isValidHour(day.to)) {
    errors.push({
      field: `${dayName}.to`,
      message: 'To hour must be a number between 0 and 23',
      value: day.to,
    });
  }

  // Validate time logic (if both hours are valid)
  if (isValidHour(day.from) && isValidHour(day.to)) {
    const isDayEnabled = day.from > 0 || day.to > 0;

    if (isDayEnabled) {
      // For enabled days, validate time ranges
      if (day.from === day.to && day.from !== 0) {
        errors.push({
          field: `${dayName}`,
          message:
            'From and to hours cannot be the same (except for closed days)',
          value: { from: day.from, to: day.to },
        });
      }

      // Handle overnight shifts (e.g., 22:00 to 06:00)
      // This is valid, so we don't need to enforce from < to
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
      errors: [
        {
          field: 'workingHours',
          message: 'Working hours must be an object',
          value: workingHours,
        },
      ],
    };
  }

  // Check for required day indices
  for (const dayIndex of VALID_DAY_INDICES) {
    const dayName = getDayName(dayIndex);

    if (!(dayIndex in workingHours)) {
      errors.push({
        field: `workingHours[${dayIndex}]`,
        message: `Missing working hours for ${dayName}`,
        value: undefined,
      });
      continue;
    }

    const dayErrors = validateDayWorkingHours(
      workingHours[dayIndex],
      `${dayName} (${dayIndex})`,
    );
    errors.push(...dayErrors);
  }

  // Check for invalid day indices
  for (const key in workingHours) {
    const dayIndex = parseInt(key);
    if (!isValidDayIndex(dayIndex)) {
      errors.push({
        field: `workingHours[${key}]`,
        message: 'Invalid day index. Must be 0-6 (Sunday-Saturday)',
        value: dayIndex,
      });
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
      // Default to closed if invalid
      sanitized[dayIndex] = { from: 0, to: 0 };
    }
  }

  return sanitized as WorkingHours;
}

export function isDayEnabled(day: DayWorkingHours): boolean {
  return day.from > 0 || day.to > 0;
}

export function formatHourToTime(hour: number): Date {
  if (!isValidHour(hour)) {
    throw new Error(`Invalid hour: ${hour}. Must be 0-23.`);
  }
  
  // Create a date in WIB timezone (UTC+7)
  const date = new Date();
  date.setUTCHours(hour - 7, 0, 0, 0); // Convert WIB to UTC for database storage
  return date;
}

export function parseTimeToHour(timeValue: string | Date): number {
  let date: Date;

  if (typeof timeValue === 'string') {
    const match = timeValue.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!match) {
      throw new Error(
        `Invalid time format: ${timeValue}. Expected HH:mm or HH:mm:ss`,
      );
    }

    const hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);

    if (!isValidHour(hour)) {
      throw new Error(`Invalid hour: ${hour}. Must be 0-23.`);
    }

    if (minute !== 0) {
      throw new Error(`Minutes must be 00. Got: ${minute}`);
    }

    return hour;
  } else if (timeValue instanceof Date) {
    // Convert UTC time from database back to WIB for display
    const hour = timeValue.getUTCHours() + 7; // Convert UTC to WIB
    const adjustedHour = hour >= 24 ? hour - 24 : hour; // Handle day overflow
    
    if (!isValidHour(adjustedHour)) {
      throw new Error(`Invalid hour: ${adjustedHour}. Must be 0-23.`);
    }

    return adjustedHour;
  } else {
    throw new Error('Time value must be a string or Date object');
  }
}

// Alternative approach using Intl.DateTimeFormat for more robust timezone handling
export function formatHourToTimeWithTimezone(hour: number): Date {
  if (!isValidHour(hour)) {
    throw new Error(`Invalid hour: ${hour}. Must be 0-23.`);
  }
  
  // Create a date representing the hour in WIB timezone
  const today = new Date();
  const wibDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, 0, 0);
  
  // Convert to UTC for database storage
  const utcDate = new Date(wibDate.getTime() - (7 * 60 * 60 * 1000));
  return utcDate;
}

export function parseTimeToHourWithTimezone(timeValue: Date): number {
  // Convert UTC time from database to WIB for display
  const wibTime = new Date(timeValue.getTime() + (7 * 60 * 60 * 1000));
  return wibTime.getUTCHours();
}

// Updated slot generation with timezone awareness
export function createSlotDateTimeInWIB(date: Date, hour: number): Date {
  // Create the slot datetime in WIB timezone
  const slotDateTime = new Date(date);
  slotDateTime.setHours(hour, 0, 0, 0);
  
  // Convert to UTC for database storage
  const utcDateTime = new Date(slotDateTime.getTime() - (7 * 60 * 60 * 1000));
  return utcDateTime;
}

// Helper function to display time in WIB format
export function displayTimeInWIB(utcDate: Date): string {
  const wibTime = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
  return wibTime.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

// Helper function to get current time in WIB
export function getCurrentTimeInWIB(): Date {
  const now = new Date();
  return new Date(now.getTime() + (7 * 60 * 60 * 1000));
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
  const weeklySlots = [];

  for (const dayIndex of VALID_DAY_INDICES) {
    const dayHours = workingHours[dayIndex];
    const isEnabled = isDayEnabled(dayHours);

    weeklySlots.push({
      ownerId,
      dayOfWeek: DAY_NUMBER_TO_ENUM[dayIndex],
      isEnabled,
      startTime: formatHourToTime(dayHours.from),
      endTime: formatHourToTime(dayHours.to),
    });
  }

  return weeklySlots;
}

export function transformFromDatabaseFormat(weeklySlots: any[]): WorkingHours {
  const workingHours: Partial<WorkingHours> = {};

  for (const dayIndex of VALID_DAY_INDICES) {
    workingHours[dayIndex] = { from: 0, to: 0 };
  }

  weeklySlots.forEach((slot) => {
    const dayIndex =
      DAY_ENUM_TO_NUMBER[slot.dayOfWeek as keyof typeof DAY_ENUM_TO_NUMBER];
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

  return workingHours as WorkingHours;
}
