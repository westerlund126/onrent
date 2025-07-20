'use client';

import { useEffect, useRef } from 'react';
import { HiX } from 'react-icons/hi';
import Links from './components/Links';
import { IRoute } from 'types/navigation';
import Logo from '/public/img/logo.png';
import NavLink from 'components/link/NavLink';
import Image from 'next/image';

function SidebarHorizon(props: {
  routes: IRoute[];
  open: boolean;
  setOpen: (open: boolean) => void;
  [x: string]: any;
}) {
  const { routes, open, setOpen } = props;
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isMobile = window.innerWidth < 1280;

      if (
        isMobile &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  return (
    <div
      ref={sidebarRef}
      className={`sm:none duration-175 linear fixed !z-50 flex min-h-full w-64 flex-col bg-white pb-10 shadow-2xl shadow-white/5 transition-all dark:!bg-navy-800 dark:text-white md:!z-50 lg:!z-50 xl:!z-0 ${
        open ? 'translate-x-0' : '-translate-x-96 xl:translate-x-0'
      }`}
    >
      <span
        className="absolute right-4 top-4 block cursor-pointer xl:hidden"
        onClick={() => setOpen(false)}
      >
        <HiX />
      </span>

      <div className={`mx-[56px] mt-[50px] flex items-center`}>
        <NavLink href="/default">
          <Image
            src={Logo.src}
            alt="Logo-OnRent"
            className="h-15 w-auto"
            width={5}
            height={5}
          />
        </NavLink>
      </div>
      <div className="mb-7 mt-[58px] h-px bg-gray-300 dark:bg-white/30" />

      <ul className="mb-auto pt-1">
        <Links routes={routes} />
      </ul>
    </div>
  );
}

export default SidebarHorizon;
