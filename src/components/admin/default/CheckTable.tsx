'use client';
import React, { useEffect } from 'react';
import Card from 'components/card';
import { FaUser, FaCalendarCheck } from 'react-icons/fa';
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

  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <FaCalendarCheck className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-700">
        Tidak ada agenda mendatang
      </h3>
      <p className="max-w-xs text-center text-sm text-gray-500">
        Belum ada jadwal fitting yang akan datang. Agenda baru akan muncul di
        sini.
      </p>
    </div>
  );

  // Loading State Component
  const LoadingState = () => (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-4 rounded-xl border border-gray-200 p-4"
        >
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-gray-200"></div>
            <div className="h-3 w-2/3 rounded bg-gray-200"></div>
          </div>
          <div className="h-4 w-4 rounded bg-gray-200"></div>
        </div>
      ))}
    </div>
  );

  // Error State Component
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <svg
          className="h-8 w-8 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-700">
        Terjadi kesalahan
      </h3>
      <p className="max-w-xs text-center text-sm text-gray-500">
        Tidak dapat memuat agenda. Silakan coba lagi nanti.
      </p>
    </div>
  );

  return (
    <Card extra="w-full px-4 py-6 rounded-3xl bg-white">
      <h2 className="mb-4 text-xl font-bold text-navy-700">Agenda Mendatang</h2>

      <div className="flex flex-col gap-4">
        {isLoading && <LoadingState />}

        {error && <ErrorState />}

        {!isLoading && !error && upcomingSchedules.length === 0 && (
          <EmptyState />
        )}

        {!isLoading &&
          !error &&
          upcomingSchedules.length > 0 &&
          upcomingSchedules.slice(0, 5).map((schedule: IFittingSchedule) => {
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
                    {format(
                      scheduleDateTime,
                      "EEEE, dd MMM yyyy 'pukul' HH:mm",
                      {
                        locale: id,
                      },
                    )}
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
