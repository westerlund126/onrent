'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDisclosure } from 'hooks/use-disclosure';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
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
import { SingleDatePicker } from 'components/date-time-range-picker/single-date-picker';
import { useScheduleStore } from 'stores';
import { eventSchema, TEventFormData } from 'variables/fitting/schemas';
import { useMemo, useEffect, useState } from 'react';
import {id} from 'date-fns/locale';
import {parse}  from 'date-fns';
import { toZonedTime, format} from 'date-fns-tz';


const timeZone = 'Asia/Jakarta';
interface IProps {
  children: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

export function AddEventDialog({ children, startDate, startTime }: IProps) {
  const { isOpen, onClose, onToggle } = useDisclosure();
  const {
    addScheduleBlock,
    isLoading,
    fittingSlots,
    fetchAllAvailableSlots,
    getAvailableSlots,
  } = useScheduleStore();

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      description: '',
      startTime: '',
      endTime: '',
    },
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const selectedStartTime = form.watch('startTime');

  useEffect(() => {
    if (isOpen) {
      console.log('🚀 Fetching all available slots...');
      fetchAllAvailableSlots();
    }
  }, [isOpen, fetchAllAvailableSlots]);

  useEffect(() => {
    console.log('🔍 Store state changed:');
    console.log('  - fittingSlots length:', fittingSlots?.length || 0);
    console.log('  - isLoading:', isLoading);

    if (fittingSlots && fittingSlots.length > 0) {
      console.log('  - First few slots:', fittingSlots.slice(0, 3));
    }
  }, [fittingSlots, isLoading]);

  const availableDates = useMemo(() => {
    console.log('🔄 availableDates useMemo called');
    console.log('🔍 Current fittingSlots:', fittingSlots?.length || 0);
  
    if (!fittingSlots || fittingSlots.length === 0) {
      console.log('⚠️ No fitting slots available in store');
      return [];
    }
  
    const availableSlots = getAvailableSlots();
    console.log('📋 Available slots from store:', availableSlots.length);
  
    if (availableSlots.length === 0) {
      console.log('⚠️ No available slots found');
      return [];
    }
  
    // ✅ ADD THIS DEBUG CODE
    console.log('🧪 DEBUG: First 10 slots with day names:');
    availableSlots.slice(0, 10).forEach((slot, index) => {
      const date = new Date(slot.dateTime);
      const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });
      const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday
      console.log(`  ${index + 1}. ${dayName} (${dayOfWeek}) - ${slot.dateTime}`);
    });
  
    // ✅ CHECK FOR SATURDAY SPECIFICALLY
    const saturdaySlots = availableSlots.filter((slot) => {
      const date = new Date(slot.dateTime);
      return date.getDay() === 6; 
    });
    console.log('🧪 DEBUG: Saturday slots found:', saturdaySlots.length);
    if (saturdaySlots.length > 0) {
      console.log('🧪 DEBUG: First Saturday slot:', saturdaySlots[0]);
    }
  
    const uniqueDates = new Set<string>();
  
    availableSlots.forEach((slot, index) => {
      try {
        let date: Date;
  
        if (slot.dateTime instanceof Date) {
          date = slot.dateTime;
        } else if (typeof slot.dateTime === 'string') {
          date = new Date(slot.dateTime);
        } else {
          console.warn('⚠️ Invalid dateTime format:', slot.dateTime);
          return; 
        }
  
        if (isNaN(date.getTime())) {
          console.warn('⚠️ Invalid date:', slot.dateTime);
          return; 
        }
  
        const dateString =
          date.getFullYear() +
          '-' +
          String(date.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(date.getDate()).padStart(2, '0');
  
        uniqueDates.add(dateString);
  
        if (date.getDay() === 6) {
          console.log(`🧪 DEBUG: Saturday date added: ${dateString}`);
        }
  
        if (index < 5) {
          console.log(
            `📅 Processing slot ${index + 1}: ${slot.id} -> dateTime: ${
              slot.dateTime
            } -> formatted: ${dateString}`,
          );
        }
      } catch (error) {
        console.error('❌ Error processing slot:', slot, error);
      }
    });
  
    const result = Array.from(uniqueDates).sort();
    
    const saturdayDates = result.filter(dateStr => {
      const date = new Date(dateStr);
      return date.getDay() === 6;
    });
    console.log('🧪 DEBUG: Saturday dates in final result:', saturdayDates);
    
    console.log('📊 Final availableDates:', result);
    console.log('📊 Number of available dates:', result.length);
  
    return result;
  }, [fittingSlots, getAvailableSlots]);

  useEffect(() => {
    console.log('🎯 availableDates changed:', availableDates);
  }, [availableDates]);

  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];

    const selectedDateString =
      selectedDate.getFullYear() +
      '-' +
      String(selectedDate.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(selectedDate.getDate()).padStart(2, '0');

    const availableSlots = getAvailableSlots();
    const slotsForDate = availableSlots.filter((slot) => {
      const slotDate = new Date(slot.dateTime);
      const slotDateString =
        slotDate.getFullYear() +
        '-' +
        String(slotDate.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(slotDate.getDate()).padStart(2, '0');
      return slotDateString === selectedDateString;
    });

    return slotsForDate
      .map((slot) => {
        const time = new Date(slot.dateTime);
        const timeString = time.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        return {
          value: slot.dateTime.toISOString(),
          label: timeString,
          slot: slot,
        };
      })
      .sort(
        (a, b) => new Date(a.value).getTime() - new Date(b.value).getTime(),
      );
  }, [selectedDate, getAvailableSlots]);

  const availableEndTimes = useMemo(() => {
    if (!selectedStartTime) return [];

    const startTime = new Date(selectedStartTime);

    return availableTimes
      .filter((time) => new Date(time.value) > startTime)
      .map((time) => ({
        value: time.value,
        label: time.label,
      }));
  }, [selectedStartTime, availableTimes]);

  const onSubmit = async (values: TEventFormData) => {
    try {
      const scheduleBlockData = {
        startTime: values.startTime,
        endTime: values.endTime,
        description: values.description,
      };

      await addScheduleBlock(scheduleBlockData);
      onClose();
      form.reset({
        description: '',
        startTime: '',
        endTime: '',
      });
      setSelectedDate(undefined);
    } catch (error) {
      console.error('Failed to create schedule block:', error);
    }
  };

  const handleDialogClose = () => {
    onClose();
    form.reset({
      description: '',
      startTime: '',
      endTime: '',
    });
    setSelectedDate(undefined);
  };

  const handleDateSelect = (date: Date | undefined) => {
    console.log('🗓️ Date selected:', date);
    setSelectedDate(date);
    form.setValue('startTime', '');
    form.setValue('endTime', '');
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          onToggle();
        } else {
          handleDialogClose();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Block Time Period</DialogTitle>
          <DialogDescription>
            Create a blocked time period when you are not available for
            fittings. This will prevent customers from booking appointments
            during this time.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="schedule-block-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <FormControl>
                    <Input
                      id="description"
                      placeholder="e.g., Vacation, Meeting, Personal Time"
                      data-invalid={fieldState.invalid}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-2">
              <label className="text-sm font-medium">Date</label>
              <SingleDatePicker
                value={selectedDate}
                onSelect={handleDateSelect}
                availableDates={availableDates}
                placeholder="Select date"
              />
            </div>

            <FormField
              control={form.control}
              name="startTime"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('endTime', '');
                      }}
                      disabled={!selectedDate || availableTimes.length === 0}
                    >
                      <SelectTrigger
                        className={fieldState.invalid ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimes.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={
                        !selectedStartTime || availableEndTimes.length === 0
                      }
                    >
                      <SelectTrigger
                        className={fieldState.invalid ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEndTimes.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="size-3.5 rounded-full bg-red-600" />
              Blocked periods will appear in red on your calendar
            </div>
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
          </DialogClose>

          <Button
            form="schedule-block-form"
            type="submit"
            disabled={isLoading || !form.formState.isValid}
            className="min-w-[120px]"
          >
            {isLoading ? 'Creating...' : 'Block Time'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}