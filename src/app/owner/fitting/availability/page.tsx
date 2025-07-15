'use client';

import { Settings, CalendarClockIcon } from 'lucide-react';

import { ChangeWorkingHoursInput } from 'components/admin/fitting/calendar/change-working-hours-input';
import { ChangeBadgeVariantInput } from 'components/admin/fitting/calendar/change-badge-variant-input';
import { ChangeAutoConfirm } from 'components/admin/fitting/calendar/change-auto-confirm';

const Availability = () => {
  return (
    <div className="mx-auto flex max-w-screen-2xl flex-col items-center gap-4 px-8 py-4">
      <div className="flex min-w-[1000px] flex-col rounded-lg bg-white px-12 py-8 shadow-md">
        <div className="flex-none gap-2 py-0 hover:no-underline ">
          <div className="flex items-center gap-2">
            <CalendarClockIcon className="size-4" />
            <p className="text-base font-semibold">
              Pengaturan Waktu Operasional
            </p>
          </div>
        </div>

        <div>
          <div className="mt-4 flex flex-col gap-6">
            <ChangeWorkingHoursInput />
            <div className="flex items-center gap-2">
              <Settings className="size-4" />
              <p className="text-base font-semibold">
                Pengaturan Konfirmasi Permintaan Fitting
              </p>
            </div>
            <ChangeAutoConfirm />
          </div>
        </div>

        <div>
          <div className="mt-4 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Settings className="size-4" />
              <p className="text-base font-semibold">
                Pengaturan Kalender Fitting
              </p>
            </div>
            <ChangeBadgeVariantInput />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Availability;
