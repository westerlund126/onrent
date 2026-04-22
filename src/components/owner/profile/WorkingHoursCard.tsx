// components/owner/profile/WorkingHoursCard.jsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface WorkingHoursRange {
  from: number;
  to: number;
}

interface WorkingHours {
  [dayIndex: string]: WorkingHoursRange;
}

interface WorkingHoursCardProps {
  workingHours: WorkingHours;
  className?: string;
}

const WorkingHoursCard: React.FC<WorkingHoursCardProps> = ({ workingHours, className }) => {
  const formatTime = (hour: number) => hour.toString().padStart(2, '0') + ':00';
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  return (
    <Card className={`h-full flex flex-col border-0 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-xl ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg text-gray-800">
          <div className="mr-3 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 p-2">
            <Clock className="h-4 w-4 text-white" />
          </div>
          Jam Operasional
        </CardTitle>
      </CardHeader>
      {/* MODIFIED: Added flex-grow, flex, flex-col, and justify-center */}
      <CardContent className="flex-grow flex flex-col justify-center relative z-10">
        <div className="space-y-3">
          {Object.entries(workingHours).map(([dayIndex, range]) => (
            <div
              key={dayIndex}
              className="group flex items-center justify-between rounded-xl p-3 transition-all duration-300 hover:bg-gray-50"
            >
              <span className="w-20 font-medium text-gray-700">
                {days[+dayIndex]}
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    range.from === 0 && range.to === 0
                      ? 'bg-red-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm ${
                    range.from === 0 && range.to === 0
                      ? 'to-rose-500 bg-gradient-to-r from-red-500'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                  }`}
                >
                  {range.from === 0 && range.to === 0
                    ? 'Tutup'
                    : `${formatTime(range.from)} - ${formatTime(range.to)}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkingHoursCard;