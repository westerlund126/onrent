// types/working-hours.ts

export interface DayWorkingHours {
  from: number; // 0-23 (24-hour format)
  to: number; // 0-23 (24-hour format)
}

export interface WorkingHours {
  [dayIndex: number]: DayWorkingHours;
  0: DayWorkingHours; // Sunday
  1: DayWorkingHours; // Monday
  2: DayWorkingHours; // Tuesday
  3: DayWorkingHours; // Wednesday
  4: DayWorkingHours; // Thursday
  5: DayWorkingHours; // Friday
  6: DayWorkingHours; // Saturday
}

export interface WeeklySlot {
  id?: number;
  ownerId: number;
  dayOfWeek:
    | 'SUNDAY'
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY';
  isEnabled: boolean;
  startTime: string;
  endTime: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateWorkingHoursRequest {
  workingHours: WorkingHours;
}

export interface UpdateWorkingHoursResponse {
  message: string;
  ownerId: number;
  workingHours: WorkingHours;
}

export interface GetWorkingHoursResponse {
  workingHours: WorkingHours;
}

export interface ApiError {
  error: string;
  details?: string;
}

export const VALID_DAY_INDICES = [0, 1, 2, 3, 4, 5, 6] as const;
export const VALID_HOURS = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23,
] as const;

export type ValidDayIndex = (typeof VALID_DAY_INDICES)[number];
export type ValidHour = (typeof VALID_HOURS)[number];

export interface WorkingHoursValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface WorkingHoursValidationResult {
  isValid: boolean;
  errors: WorkingHoursValidationError[];
}

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  0: { from: 0, to: 0 }, // Sunday
  1: { from: 9, to: 17 }, // Monday
  2: { from: 9, to: 17 }, // Tuesday
  3: { from: 9, to: 17 }, // Wednesday
  4: { from: 9, to: 17 }, // Thursday
  5: { from: 9, to: 17 }, // Friday
  6: { from: 0, to: 0 }, // Saturday
};

// Day names for display
export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export interface DayOfWeek {
  index: ValidDayIndex;
  name: (typeof DAY_NAMES)[number];
}
