"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, Text, User } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import type { IFittingSchedule } from 'types/fitting';

interface IProps {
  schedule: IFittingSchedule;
  children: React.ReactNode;
}

export function EventDetailsDialog({ schedule, children }: IProps) {
  const startDate = schedule.startTime;
  const endDate = schedule.endTime;

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jadwal Fitting dengan {schedule.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <User className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Pelanggan</p>
                <p className="text-sm text-muted-foreground">
                  {schedule.user.username}
                </p>
              </div>
            </div>

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
                <p className="text-sm text-muted-foreground">{schedule.note}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
