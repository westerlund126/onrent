import React from 'react';
import { FaMoneyBill } from 'react-icons/fa';

// Admin Imports

// Icon Imports
import {
  MdHome,
  MdOutlineShoppingCart,
  MdBarChart,
  MdPerson,
  MdLock,
  MdOutlineCalendarMonth,
} from 'react-icons/md';

const routes = [
  {
    name: 'Menu Utama',
    layout: '/owner',
    path: 'default',
    icon: <MdHome className="h-6 w-6" />,
  },
  {
    name: 'Jadwal Fitting',
    layout: '/owner',
    path: 'nft-marketplace',
    icon: <MdOutlineCalendarMonth className="h-6 w-6" />,

    secondary: true,
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
    layout: '/rtl',
    path: 'rtl-default',
    icon: <FaMoneyBill className="h-6 w-6" />,
  },
];
export default routes;
