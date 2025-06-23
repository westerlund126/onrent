// File: src/routes.tsx

import React, { JSX } from 'react';
import { FaMoneyBill } from 'react-icons/fa';

// Icon Imports
import {
  MdHome,
  MdOutlineShoppingCart,
  MdBarChart,
  MdPerson,
  MdLock,
  MdOutlineCalendarMonth,
  MdSchedule,
  MdEventAvailable,
} from 'react-icons/md';

export interface IRoute {
  name: string;
  layout: string;
  path: string;
  icon: JSX.Element;
  secondary?: boolean;
  subRoutes?: IRoute[];
}

const routes: IRoute[] = [
  {
    name: 'Menu Utama',
    layout: '/owner',
    path: 'default',
    icon: <MdHome className="h-6 w-6" />,
  },
  {
    name: 'Fitting',
    layout: '/owner',
    path: 'fitting',
    icon: <MdOutlineCalendarMonth className="h-6 w-6" />,
    secondary: true,
    subRoutes: [
      {
        name: 'Jadwal Fitting',
        layout: '/owner',
        path: 'fitting/schedule',
        icon: <MdSchedule className="h-5 w-5" />,
      },
      {
        name: 'Waktu Operasional',
        layout: '/owner',
        path: 'fitting/availability',
        icon: <MdEventAvailable className="h-5 w-5" />,
      },
    ],
  },
  {
    name: 'Katalog',
    layout: '/owner',
    icon: <MdOutlineShoppingCart className="h-6 w-6" />,
    path: 'catalog',
  },
  {
    name: 'Profil',
    layout: '/owner',
    path: 'profile',
    icon: <MdPerson className="h-6 w-6" />,
  },
  {
    name: 'Transaksi',
    layout: '/owner',
    path: 'transaction',
    icon: <FaMoneyBill className="h-6 w-6" />,
  },
  {
    name: 'Aktivitas',
    layout: '/customer',
    path: 'activities',
    icon: <FaMoneyBill className="h-6 w-6" />,
  },
];

export default routes;
