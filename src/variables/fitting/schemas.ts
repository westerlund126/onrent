import { z } from 'zod';

export const eventSchema = z
  .object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    description: z.string().min(1),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export type TEventFormData = z.infer<typeof eventSchema>;

export const createScheduleBlockSchema = z
  .object({
    startTime: z.string().datetime('Invalid start time format'),
    endTime: z.string().datetime('Invalid end time format'),
    description: z.string().min(1, 'Description is required'),
  })
  .refine(
    (data) => {
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      return endTime > startTime;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    },
  );

export const updateScheduleBlockSchema = z
  .object({
    startTime: z.string().datetime('Invalid start time format').optional(),
    endTime: z.string().datetime('Invalid end time format').optional(),
    description: z.string().min(1, 'Description is required').optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        return endTime > startTime;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    },
  );

export type TCreateScheduleBlockData = z.infer<
  typeof createScheduleBlockSchema
>;
export type TUpdateScheduleBlockData = z.infer<
  typeof updateScheduleBlockSchema
>;
