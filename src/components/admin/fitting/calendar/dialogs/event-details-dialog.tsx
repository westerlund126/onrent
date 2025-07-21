"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, Text, User } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import type { ICalendarEvent, IFittingSchedule, IScheduleBlock } from 'types/fitting';

interface IProps {
  schedule: ICalendarEvent;
  children: React.ReactNode;
}

export function EventDetailsDialog({ schedule, children }: IProps) {
  const startDate = schedule.startTime;
  const endDate = schedule.endTime;
  const isFittingEvent =
    schedule.type === 'fitting' && 'user' in schedule.originalData;

  const fittingData = isFittingEvent
    ? (schedule.originalData as IFittingSchedule)
    : null;

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jadwal Fitting dengan {schedule.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isFittingEvent && fittingData && (
              <div className="flex items-start gap-2">
                <User className="mt-1 size-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Pelanggan</p>
                  <p className="text-sm text-muted-foreground">
                    {fittingData.user.username}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Calendar className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Tanggal Mulai</p>
                <p className="text-sm text-muted-foreground">
                  {format(startDate, 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Tanggal Selesai</p>
                <p className="text-sm text-muted-foreground">
                  {format(endDate, 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Text className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">
                  {isFittingEvent && fittingData
                    ? fittingData.note
                    : schedule.type === 'block'
                    ? (schedule.originalData as IScheduleBlock).description
                    : 'No description available'}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}