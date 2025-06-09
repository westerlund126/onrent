import { z } from "zod";

export const eventSchema = z.object({
  user: z.string().min(1, "Please select a responsible user"),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  startDateTime: z.date({
    required_error: "Start date and time is required",
    invalid_type_error: "Please select a valid start date and time",
  }),
  endDateTime: z.date({
    required_error: "End date and time is required",
    invalid_type_error: "Please select a valid end date and time",
  }),
  color: z.enum(["blue", "green", "red", "yellow", "purple", "orange", "gray"], {
    required_error: "Please select a color",
  }),
}).refine((data) => data.endDateTime > data.startDateTime, {
  message: "End date and time must be after start date and time",
  path: ["endDateTime"],
});

export type TEventFormData = z.infer<typeof eventSchema>;