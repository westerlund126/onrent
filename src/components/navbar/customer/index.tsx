import React, { useState } from 'react';
import Dropdown from 'components/dropdown';
import { FiAlignJustify } from 'react-icons/fi';
import NavLink from 'components/link/NavLink';
// import navbarimage from '/public/img/layout/Navbar.png';
import { BsArrowBarUp } from 'react-icons/bs';
import { MdContactEmergency } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';
import { RiMoonFill, RiSunFill } from 'react-icons/ri';
import {
  IoMdNotificationsOutline,
  IoMdInformationCircleOutline,
} from 'react-icons/io';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import ContactProfile from '../ContactProfile';

const NavbarCustomer = (props: {
  onOpenSidenav: () => void;
  brandText: string;
  secondary?: boolean | string;
  isLanding?: boolean; // New prop to determine if it's landing page
  [x: string]: any;
}) => {
  const { onOpenSidenav, brandText, mini, hovered, isLanding = false } = props;
  const [darkmode, setDarkmode] = React.useState(
    document.body.classList.contains('dark'),
  );
  const router = useRouter();
  // const [isLoading, setIsLoading] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // Landing page navbar
  if (isLanding) {
    return (
      <nav className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl bg-white px-6 py-4 shadow-lg mx-2">
        {/* Left side - Menu items */}
        <div className="flex items-center space-x-8">
          <NavLink
            href="/customer/default"
            className="text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Home
          </NavLink>
          <NavLink
            href="/customer/catalog"
            className="text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Katalog
          </NavLink>
          <NavLink
            href="/customer/activities"
            className="text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Aktivitas
          </NavLink>
          <NavLink
            href="/customer/about"
            className="text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            About
          </NavLink>
        </div>

        {/* Center - Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <NavLink
            href="/customer/default"
            className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
          >
            On-Rent
          </NavLink>
        </div>

        {/* Right side - Same as original */}
        <div className="flex items-center gap-4">
          <span
            className="flex cursor-pointer text-xl text-gray-600 xl:hidden"
            onClick={onOpenSidenav}
          >
            <FiAlignJustify className="h-5 w-5" />
          </span>

          {/* Notification */}
          <Dropdown
            button={
              <p className="cursor-pointer">
                <IoMdNotificationsOutline className="h-7 w-7 text-gray-600" />
              </p>
            }
            animation="origin-[65%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
            classNames={'py-2 top-4 -left-[230px] md:-left-[440px] w-max'}
          >
            <div className="flex w-[360px] flex-col gap-3 rounded-[20px] bg-white p-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none sm:w-[460px]">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-navy-700 dark:text-white">
                  Notification
                </p>
                <p className="text-sm font-bold text-navy-700 dark:text-white">
                  Mark all read
                </p>
              </div>

              <button className="flex w-full items-center">
                <div className="flex h-full w-[85px] items-center justify-center rounded-xl bg-gradient-to-b from-brandLinear to-brand-500 py-4 text-2xl text-white">
                  <BsArrowBarUp />
                </div>
                <div className="ml-2 flex h-full w-full flex-col justify-center rounded-lg px-1 text-sm">
                  <p className="mb-1 text-left text-base font-bold text-gray-900 dark:text-white">
                    New Update: Horizon UI Dashboard PRO
                  </p>
                  <p className="font-base text-left text-xs text-gray-900 dark:text-white">
                    A new update for your downloaded item is available!
                  </p>
                </div>
              </button>

              <button className="flex w-full items-center">
                <div className="flex h-full w-[85px] items-center justify-center rounded-xl bg-gradient-to-b from-brandLinear to-brand-500 py-4 text-2xl text-white">
                  <BsArrowBarUp />
                </div>
                <div className="ml-2 flex h-full w-full flex-col justify-center rounded-lg px-1 text-sm">
                  <p className="mb-1 text-left text-base font-bold text-gray-900 dark:text-white">
                    New Update: Horizon UI Dashboard PRO
                  </p>
                  <p className="font-base text-left text-xs text-gray-900 dark:text-white">
                    A new update for your downloaded item is available!
                  </p>
                </div>
              </button>
            </div>
          </Dropdown>

          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: 'h-10 w-10',
              },
            }}
          />
        </div>
      </nav>
    );
  }

  // Original navbar for other pages
  return (
    <>
      <nav className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl bg-white/10 p-2 backdrop-blur-xl dark:bg-[#0b14374d]">
        <div className="ml-[6px]">
          <div className="h-6 w-[224px] pt-1">
            <a
              className="text-sm font-normal text-navy-700 hover:underline dark:text-white dark:hover:text-white"
              href=" "
            >
              Pages
              <span className="mx-1 text-sm text-navy-700 hover:text-navy-700 dark:text-white">
                {' '}
                /{' '}
              </span>
            </a>
            <NavLink
              className="text-sm font-normal capitalize text-navy-700 hover:underline dark:text-white dark:hover:text-white"
              href="#"
            >
              {brandText}
            </NavLink>
          </div>
          
          <p className="shrink text-[33px] capitalize text-navy-700 dark:text-white">
            <NavLink
              href="#"
              className="font-bold capitalize hover:text-navy-700 dark:hover:text-white"
            >
              {brandText}
            </NavLink>
          </p>
        </div>

        <div className="relative mt-[3px] flex h-[61px] w-[255px] flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none md:w-[265px] md:flex-grow-0 md:gap-1 xl:w-[265px] xl:gap-2">
          <span
            className="flex cursor-pointer text-xl text-gray-600 dark:text-white xl:hidden"
            onClick={onOpenSidenav}
          >
            <FiAlignJustify className="h-5 w-5" />
          </span>

          {/* start Notification */}
          <Dropdown
            button={
              <p className="cursor-pointer">
                <IoMdNotificationsOutline className="h-7 w-7 text-gray-600 dark:text-white" />
              </p>
            }
            animation="origin-[65%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
            classNames={'py-2 top-4 -left-[230px] md:-left-[440px] w-max'}
          >
            <div className="flex w-[360px] flex-col gap-3 rounded-[20px] bg-white p-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none sm:w-[460px]">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-navy-700 dark:text-white">
                  Notification
                </p>
                <p className="text-sm font-bold text-navy-700 dark:text-white">
                  Mark all read
                </p>
              </div>

              <button className="flex w-full items-center">
                <div className="flex h-full w-[85px] items-center justify-center rounded-xl bg-gradient-to-b from-brandLinear to-brand-500 py-4 text-2xl text-white">
                  <BsArrowBarUp />
                </div>
                <div className="ml-2 flex h-full w-full flex-col justify-center rounded-lg px-1 text-sm">
                  <p className="mb-1 text-left text-base font-bold text-gray-900 dark:text-white">
                    New Update: Horizon UI Dashboard PRO
                  </p>
                  <p className="font-base text-left text-xs text-gray-900 dark:text-white">
                    A new update for your downloaded item is available!
                  </p>
                </div>
              </button>

              <button className="flex w-full items-center">
                <div className="flex h-full w-[85px] items-center justify-center rounded-xl bg-gradient-to-b from-brandLinear to-brand-500 py-4 text-2xl text-white">
                  <BsArrowBarUp />
                </div>
                <div className="ml-2 flex h-full w-full flex-col justify-center rounded-lg px-1 text-sm">
                  <p className="mb-1 text-left text-base font-bold text-gray-900 dark:text-white">
                    New Update: Horizon UI Dashboard PRO
                  </p>
                  <p className="font-base text-left text-xs text-gray-900 dark:text-white">
                    A new update for your downloaded item is available!
                  </p>
                </div>
              </button>
            </div>
          </Dropdown>

          <UserButton
                      appearance={{
                        elements: {
                          userButtonAvatarBox: 'h-10 w-10',
                        },
                      }}
                    >
                      <UserButton.UserProfilePage
                        label="Kontak"
                        labelIcon={<MdContactEmergency size={17} />}
                        url="contact"
                      >
                        <ContactProfile />
                      </UserButton.UserProfilePage>
                    </UserButton>

          {/* Profile & Dropdown */}
          {/* <Dropdown
            button={
              <Image
                width="2"
                height="20"
                className="h-10 w-10 rounded-full"
                src={avatar}
                alt="Elon Musk"
              />
            }
            classNames={'py-2 top-8 -left-[180px] w-max'}
          >
            <div className="flex h-48 w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
              <div className="ml-4 mt-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    👋 Hey, Adela
                  </p>{' '}
                </div>
              </div>
              <div className="mt-3 h-px w-full bg-gray-200 dark:bg-white/20 " />

              <div className="ml-4 mt-3 flex flex-col">
                <a
                  href=" "
                  className="text-sm text-gray-800 dark:text-white hover:dark:text-white"
                >
                  Profile Settings
                </a>
                <a
                  href=" "
                  className="mt-3 text-sm text-gray-800 dark:text-white hover:dark:text-white"
                >
                  Newsletter Settings
                </a>
                <button
                  onClick={handleLogoutClick}
                  disabled={isLoading}
                  className="mt-3 text-left text-sm font-medium text-red-500 hover:text-red-500"
                >
                  Keluar
                </button>
              </div>
            </div>
          </Dropdown> */}
        </div>
      </nav>
    </>
  );
};

export default NavbarCustomer;