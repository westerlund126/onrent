'use client';
import { usePathname } from 'next/navigation';
import { useContext, useState } from 'react';
import customerRoutes from 'routes';
import {
  getActiveNavbar,
  getActiveRoute,
  isWindowAvailable,
} from 'utils/navigation';
import React from 'react';
import Navbar from 'components/navbar/customer';
// import Sidebar from 'components/sidebar';
import Footer from 'components/footer/Footer';

export default function Customer({ children }: { children: React.ReactNode }) {
  // states and functions
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  
  // Check if current page is landing page
  const isLandingPage = pathname === '/customer/default' || pathname === '/customer';
  
  if (isWindowAvailable()) document.documentElement.dir = 'ltr';
  
  return (
    <div className="flex h-full w-full bg-background-100 dark:bg-background-900">
      {/* <Sidebar routes={routes} open={open} setOpen={setOpen} variant="owner" /> */}
      {/* Navbar & Main Content */}
      <div className="h-full w-full font-dm dark:bg-navy-900">
        {/* Main Content */}
        <main
          className={`mx-3.5 flex-none transition-all dark:bg-navy-900
               md:pr-2`}
        >
          {/* Routes */}
          <div>
            <Navbar
              onOpenSidenav={() => setOpen(!open)}
              brandText={getActiveRoute(customerRoutes, pathname)}
              secondary={getActiveNavbar(customerRoutes, pathname)}
              isLanding={isLandingPage}
            />
            <div className="mx-auto min-h-screen p-2 !pt-[10px] md:p-20">
              {children}
            </div>
            <div className="p-3">
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}