'use client';

import { useEffect, useState } from 'react';
import { Info, Moon, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWorkingHoursStore } from 'stores/useWorkingHoursStore';
// --- FIX: Import the correct type from its original source ---
import type { TWorkingHours } from 'types/fitting';

const DAYS_OF_WEEK = [
  { index: 0, name: 'Minggu' },
  { index: 1, name: 'Senin' },
  { index: 2, name: 'Selasa' },
  { index: 3, name: 'Rabu' },
  { index: 4, name: 'Kamis' },
  { index: 5, name: 'Jumat' },
  { index: 6, name: 'Sabtu' },
];

const HourSelect = ({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (hour: number) => void;
  disabled?: boolean;
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {Array.from({ length: 24 }, (_, i) => (
        <option key={i} value={i}>
          {i.toString().padStart(2, '0')}:00
        </option>
      ))}
    </select>
  );
};

export function ChangeWorkingHoursInput() {
  const {
    workingHours,
    fetchWorkingHours,
    updateWorkingHours,
    isLoading,
    error,
  } = useWorkingHoursStore();

  // --- FIX: Use the correct type ---
  const [localWorkingHours, setLocalWorkingHours] = useState<TWorkingHours>({
    ...workingHours,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkingHours().then(() => {
      const fetchedUtcHours = useWorkingHoursStore.getState().workingHours;
      console.log('Data from API (UTC):', fetchedUtcHours);

      const wibHoursForDisplay: TWorkingHours = { ...fetchedUtcHours };

      // Type-safe loop to convert UTC to WIB for display
      for (let i = 0; i < 7; i++) {
        const dayIndex = i as keyof TWorkingHours;
        const day = wibHoursForDisplay[dayIndex];

        // Only convert hours for active days, leave {from: 0, to: 0} as is
        if (day && (day.from !== 0 || day.to !== 0)) {
          wibHoursForDisplay[dayIndex] = {
            from: (day.from + 7) % 24,
            to: (day.to + 7) % 24,
          };
        }
      }

      console.log('Data for Display (WIB):', wibHoursForDisplay);
      setLocalWorkingHours(wibHoursForDisplay);
    });
  }, [fetchWorkingHours]);

  const handleToggleDay = (dayIndex: number) => {
    setLocalWorkingHours((prev) => ({
      ...prev,
      [dayIndex]:
        prev[dayIndex as keyof TWorkingHours].from > 0 ||
        prev[dayIndex as keyof TWorkingHours].to > 0
          ? { from: 0, to: 0 }
          : { from: 9, to: 17 }, // Default WIB hours
    }));
  };

  const handleTimeChange = (
    dayIndex: number,
    type: 'from' | 'to',
    hour: number,
  ) => {
    setLocalWorkingHours((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex as keyof TWorkingHours],
        [type]: hour,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccess(null);

    const hoursInWIB = localWorkingHours;
    const hoursToSendInUTC: TWorkingHours = { ...hoursInWIB };

    // Type-safe loop to convert WIB back to UTC for saving
    for (let i = 0; i < 7; i++) {
      const dayIndex = i as keyof TWorkingHours;
      const day = hoursToSendInUTC[dayIndex];

      // Only convert hours for active days
      if (day && (day.from !== 0 || day.to !== 0)) {
        hoursToSendInUTC[dayIndex] = {
          from: (day.from - 7 + 24) % 24, // Add 24 to prevent negative numbers
          to: (day.to - 7 + 24) % 24,
        };
      }
    }

    console.log('Data being sent to API (UTC):', hoursToSendInUTC);

    try {
      await updateWorkingHours(hoursToSendInUTC);
      setSuccess('Jam Operasional berhasil diperbarui.');
    } catch (err) {
      // Optional: Handle error display
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold">Ubah jam operasional</p>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger>
              <Info className="size-3" />
            </TooltipTrigger>
            <TooltipContent className="max-w-80 text-center">
              <p>
                This will apply a dashed background to the hour cells that fall
                outside the working hours — only for week and day views.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading jam operasional...
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default">
          <CheckCircle className="size-4 text-green-600" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayData = localWorkingHours[day.index as keyof TWorkingHours];
          const isDayActive = dayData && (dayData.from > 0 || dayData.to > 0);

          return (
            <div
              key={day.index}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex w-40 items-center gap-2">
                <Switch
                  checked={!!isDayActive}
                  onCheckedChange={() => handleToggleDay(day.index)}
                />
                <span className="text-sm font-medium">{day.name}</span>
              </div>

              {isDayActive ? (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span>Dari</span>
                    <HourSelect
                      value={dayData.from}
                      onChange={(hour) =>
                        handleTimeChange(day.index, 'from', hour)
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Sampai</span>
                    <HourSelect
                      value={dayData.to}
                      onChange={(hour) =>
                        handleTimeChange(day.index, 'to', hour)
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Moon className="size-4" />
                  <span>Tutup</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button className="mt-4 w-fit" onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Menyimpan...' : 'Simpan'}
      </Button>
    </div>
  );
}
