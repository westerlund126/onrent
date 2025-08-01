'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDisclosure } from 'hooks/use-disclosure';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { toZonedTime, format } from 'date-fns-tz';

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
    scheduleBlocks, 
    fetchAllAvailableSlots,
    fetchScheduleBlocks,
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
      fetchAllAvailableSlots();

      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 90);

      fetchScheduleBlocks(today.toISOString(), futureDate.toISOString());
    }
  }, [isOpen, fetchAllAvailableSlots, fetchScheduleBlocks]);

  useEffect(() => {
    if (fittingSlots && fittingSlots.length > 0) {
      console.log('  - First few slots:', fittingSlots.slice(0, 3));
    }
  }, [fittingSlots, isLoading]);

  const isTimeBlockedByScheduleBlock = (
    startTime: Date,
    endTime: Date,
  ): boolean => {
    return scheduleBlocks.some((block) => {
      const blockStart = new Date(block.startTime);
      const blockEnd = new Date(block.endTime);

      return startTime < blockEnd && endTime > blockStart;
    });
  };

  const availableDates = useMemo(() => {
    const availableSlots = getAvailableSlots();
    if (!availableSlots || availableSlots.length === 0) {
      return [];
    }

    const uniqueDates = new Set<string>();

    availableSlots.forEach((slot) => {
      const zonedDate = toZonedTime(slot.dateTime, timeZone);
      const dateString = format(zonedDate, 'yyyy-MM-dd');
      uniqueDates.add(dateString);
    });

    return Array.from(uniqueDates).sort();
  }, [fittingSlots, getAvailableSlots]);

  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];

    const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
    const availableSlots = getAvailableSlots();

    const slotsForDate = availableSlots.filter((slot) => {
      const slotDateString = format(slot.dateTime, 'yyyy-MM-dd');
      return slotDateString === selectedDateString;
    });

    return slotsForDate
      .map((slot) => {
        const dateTime = slot.dateTime ? new Date(slot.dateTime) : new Date();
        const label = format(dateTime, 'HH:mm');

        return {
          value: dateTime.toISOString(),
          label: label,
          slot: slot,
        };
      })
      .filter((timeOption) => {
        const startTime = new Date(timeOption.value);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

        return !isTimeBlockedByScheduleBlock(startTime, endTime);
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [selectedDate, getAvailableSlots, scheduleBlocks]);

  const availableEndTimes = useMemo(() => {
    if (!selectedStartTime) return [];

    const startTime = new Date(selectedStartTime);

    return availableTimes
      .filter((time) => new Date(time.value) > startTime)
      .filter((timeOption) => {
        const endTime = new Date(timeOption.value);

        return !isTimeBlockedByScheduleBlock(startTime, endTime);
      })
      .map((time) => ({
        value: time.value,
        label: time.label,
      }));
  }, [selectedStartTime, availableTimes, scheduleBlocks]);

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
          <DialogTitle>Periode Blokir Jadwal</DialogTitle>
          <DialogDescription>
            Blokir periode waktu tertentu pada kalender Anda untuk menghindari
            penjadwalan acara pada waktu tersebut.
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
                  <FormLabel htmlFor="description">Deskripsi</FormLabel>
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
              <label className="text-sm font-medium">Tanggal</label>
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
                  <FormLabel>Waktu Mulai</FormLabel>
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
                  <FormLabel>Waktu Berakhir</FormLabel>
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
              <div className="size-3.5 rounded-full bg-gray-700" />
              Jadwal yang diblokir akan ditampilkan dengan warna abu-abu pada
              kalender Anda.
            </div>
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={handleDialogClose}>
              Batal
            </Button>
          </DialogClose>

          <Button
            form="schedule-block-form"
            type="submit"
            disabled={isLoading || !form.formState.isValid}
            className="min-w-[120px]"
          >
            {isLoading ? 'Menyimpan...' : 'Blokir Jadwal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
