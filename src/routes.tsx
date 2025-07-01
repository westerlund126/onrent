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
  MdPeople,
} from 'react-icons/md';

export interface IRoute {
  name: string;
  layout: string;
  path: string;
  icon: JSX.Element;
  secondary?: boolean;
  subRoutes?: IRoute[];
}

// Owner routes
const ownerRoutes: IRoute[] = [
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
];

// Admin routes
const adminRoutes: IRoute[] = [
  {
    name: 'Transaksi',
    layout: '/admin',
    path: 'transaction',
    icon: <FaMoneyBill className="h-6 w-6" />,
  },
  {
    name: 'Katalog',
    layout: '/admin',
    path: 'catalog',
    icon: <MdOutlineShoppingCart className="h-6 w-6" />,
  },
  {
    name: 'Pengguna',
    layout: '/admin',
    path: 'users',
    icon: <MdPeople className="h-6 w-6" />,
  },
];

// Customer routes
const customerRoutes: IRoute[] = [
  {
    name: 'Aktivitas',
    layout: '/customer',
    path: 'activities',
    icon: <FaMoneyBill className="h-6 w-6" />,
  },
];

// Function to get routes based on role
export const getRoutesByRole = (role: string): IRoute[] => {
  const normalizedRole = role.toLowerCase();
  switch (normalizedRole) {
    case 'owner':
      return ownerRoutes;
    case 'admin':
      return adminRoutes;
    case 'customer':
      return customerRoutes;
    default:
      console.warn(`Unknown role: ${role}, defaulting to owner routes`);
      return ownerRoutes;
  }
};

// Export individual route arrays
export { ownerRoutes, adminRoutes, customerRoutes };

// Default export (for backward compatibility)
export default ownerRoutes;