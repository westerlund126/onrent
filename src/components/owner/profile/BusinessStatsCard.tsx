'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, TrendingUp, Users, Calendar, LucideIcon } from 'lucide-react';

interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

interface BusinessStatsCardProps {
  stats?: Stat[];
}

const BusinessStatsCard: React.FC<BusinessStatsCardProps> = ({
  stats = [
    {
      label: 'Total Produk',
      value: '156',
      icon: Store,
      color: 'from-violet-600 to-indigo-600',
    },
    {
      label: 'Rental Aktif',
      value: '23',
      icon: TrendingUp,
      color: 'from-emerald-600 to-teal-600',
    },
    {
      label: 'Total Pelanggan',
      value: '342',
      icon: Users,
      color: 'from-orange-600 to-red-600',
    },
    {
      label: 'Fitting Terjadwal',
      value: '8',
      icon: Calendar,
      color: 'from-pink-600 to-rose-600',
    },
  ],
}) => {
  return (
    <Card className="border-0 bg-white/80 transition-all duration-500 hover:shadow-2xl">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl text-gray-800">
          Statistik Bisnis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              key={index}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br p-6 shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-xl"
              style={{
                background: 'linear-gradient(135deg, var(--tw-gradient-stops))',
                backgroundImage:
                  'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))',
              }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-90`}
              />
              <div className="absolute right-2 top-2 opacity-10">
                <Icon className="h-12 w-12" />
              </div>
              <div className="relative z-10">
                <div className="mb-2 flex items-center gap-3">
                  <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                </div>
                <div className="font-medium text-white/90">{stat.label}</div>
              </div>
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default BusinessStatsCard;
