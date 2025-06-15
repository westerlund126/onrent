'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDisclosure } from 'hooks/use-disclosure';
import { useCalendar } from 'contexts/calendar-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Form,
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogHeader,
  DialogClose,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { DateTimeInput } from 'components/date-time-range-picker/date-time-input';

import { eventSchema, TEventFormData } from 'variables/fitting/schemas';

interface IProps {
  children: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

export function AddEventDialog({ children, startDate, startTime }: IProps) {
  const { users } = useCalendar();

  const { isOpen, onClose, onToggle } = useDisclosure();

  const getInitialDateTime = () => {
    if (startDate) {
      const date = new Date(startDate);
      if (startTime) {
        date.setHours(startTime.hour, startTime.minute, 0, 0);
      }
      return date;
    }
    return undefined;
  };

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      startDateTime: getInitialDateTime(),
      endDateTime: undefined,
    },
  });

  const onSubmit = (_values: TEventFormData) => {
    // TO DO: Create use-add-event hook
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            This is just an example of how to use the form. In a real
            application, you would call the API to create the event
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="event-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >

            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="title">Title</FormLabel>

                  <FormControl>
                    <Input
                      id="title"
                      placeholder="Enter a title"
                      data-invalid={fieldState.invalid}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDateTime"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Start Date & Time</FormLabel>
                  <FormControl>
                    <DateTimeInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select start date and time"
                      use24HourFormat
                      data-invalid={fieldState.invalid}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDateTime"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>End Date & Time</FormLabel>
                  <FormControl>
                    <DateTimeInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select end date and time"
                      use24HourFormat
                      data-invalid={fieldState.invalid}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>

                      <SelectContent>

                        <SelectItem value="gray">
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-600 size-3.5 rounded-full" />
                            Gray
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>

                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value}
                      data-invalid={fieldState.invalid}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>

          <Button form="event-form" type="submit">
            Create Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
