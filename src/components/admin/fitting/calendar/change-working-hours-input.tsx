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
import {
  useWorkingHoursStore
} from 'stores/useWorkingHoursStore';

const DAYS_OF_WEEK = [
  { index: 0, name: 'Sunday' },
  { index: 1, name: 'Monday' },
  { index: 2, name: 'Tuesday' },
  { index: 3, name: 'Wednesday' },
  { index: 4, name: 'Thursday' },
  { index: 5, name: 'Friday' },
  { index: 6, name: 'Saturday' },
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
    setWorkingHours,
    fetchWorkingHours,
    updateWorkingHours,
    isLoading,
    error,
  } = useWorkingHoursStore();

  const [localWorkingHours, setLocalWorkingHours] = useState<typeof workingHours>({
    ...workingHours,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch on mount
  useEffect(() => {
    fetchWorkingHours().then(() => {
      setLocalWorkingHours(useWorkingHoursStore.getState().workingHours);
    });
  }, [fetchWorkingHours]);

  const handleToggleDay = (dayIndex: number) => {
    setLocalWorkingHours((prev) => ({
      ...prev,
      [dayIndex]:
        prev[dayIndex].from > 0 || prev[dayIndex].to > 0
          ? { from: 0, to: 0 }
          : { from: 9, to: 17 },
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
        ...prev[dayIndex],
        [type]: hour,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccess(null);

    try {
      await updateWorkingHours(localWorkingHours);
      setSuccess('Working hours updated successfully.');
    } catch (err) {
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold">Change working hours</p>
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
          Loading working hours...
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
          const isDayActive =
            localWorkingHours[day.index].from > 0 ||
            localWorkingHours[day.index].to > 0;

          return (
            <div
              key={day.index}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex w-40 items-center gap-2">
                <Switch
                  checked={isDayActive}
                  onCheckedChange={() => handleToggleDay(day.index)}
                />
                <span className="text-sm font-medium">{day.name}</span>
              </div>

              {isDayActive ? (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span>From</span>
                    <HourSelect
                      value={localWorkingHours[day.index].from}
                      onChange={(hour) =>
                        handleTimeChange(day.index, 'from', hour)
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span>To</span>
                    <HourSelect
                      value={localWorkingHours[day.index].to}
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
        {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
        {isSaving ? 'Menyimpan...' : 'Simpan'}
      </Button>
    </div>
  );
}
