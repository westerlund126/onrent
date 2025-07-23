// components/AgendaList.tsx (or your file path)

'use client'; // Required for using React hooks

import React, { useEffect } from 'react';
import Card from 'components/card';
import { FaUser } from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';
import { useFittingStore } from 'stores';
import type { IFittingSchedule } from 'types/fitting';

function AgendaList() {
  const { fittingSchedules, fetchFittingSchedules, isLoading, error } =
    useFittingStore();

  useEffect(() => {
    const today = new Date().toISOString();
    fetchFittingSchedules(today, undefined);
  }, [fetchFittingSchedules]);

  const upcomingSchedules = fittingSchedules
    .filter(
      (schedule) =>
        new Date(schedule.fittingSlot.dateTime) >= new Date() &&
        (schedule.status === 'PENDING' || schedule.status === 'CONFIRMED'),
    )
    .sort(
      (a, b) =>
        new Date(a.fittingSlot.dateTime).getTime() -
        new Date(b.fittingSlot.dateTime).getTime(),
    );

  return (
    <Card extra="w-full px-4 py-6 rounded-3xl bg-white">
      <h2 className="mb-4 text-xl font-bold text-navy-700">Agenda Mendatang</h2>
      <div className="flex flex-col gap-4">
        {isLoading && (
          <p className="text-center text-gray-500">Memuat agenda...</p>
        )}
        {error && (
          <p className="text-center text-red-500">
            Terjadi kesalahan saat memuat agenda.
          </p>
        )}
        {!isLoading && upcomingSchedules.length === 0 && (
          <p className="text-center text-gray-500">
            Tidak ada agenda mendatang.
          </p>
        )}

        {upcomingSchedules.slice(0, 5).map((schedule: IFittingSchedule) => {
          const customerName =
            `${schedule.user.first_name || ''} ${
              schedule.user.last_name || ''
            }`.trim() || schedule.user.username;
          const scheduleDateTime = new Date(schedule.fittingSlot.dateTime);

          return (
            <div
              key={schedule.id}
              className="group flex cursor-pointer items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-navy-700 shadow-md transition-all hover:border-orange-500 hover:bg-orange-500 hover:text-white"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-gray-500">
                {schedule.user.imageUrl ? (
                  <Image
                    width={40}
                    height={40}
                    src={schedule.user.imageUrl}
                    alt={customerName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FaUser size={20} />
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-bold transition-colors">
                  {customerName}
                </h3>
                <p className="mt-1 text-xs text-gray-500 transition-colors group-hover:text-white">
                  {format(scheduleDateTime, "EEEE, dd MMM yyyy 'pukul' HH:mm", {
                    locale: id,
                  })}
                </p>
                {schedule.note && (
                  <p className="mt-1 text-sm italic text-gray-600 transition-colors group-hover:text-white">
                    "{schedule.note}"
                  </p>
                )}
              </div>

              <div>
                <span className="text-xl text-gray-400 transition-colors group-hover:text-white">
                  &#8250;
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default AgendaList;
