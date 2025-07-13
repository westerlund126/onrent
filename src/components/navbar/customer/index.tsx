import React, { useState } from 'react';
import Dropdown from 'components/dropdown';
import { FiAlignJustify, FiSearch } from 'react-icons/fi';
import NavLink from 'components/link/NavLink';
import Logo from '/public/img/logo.png';
import { BsArrowBarUp } from 'react-icons/bs';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { UserButton } from '@clerk/nextjs';
import SearchComponent from 'components/search/Search';

const NavbarCustomer = (props: {
  brandText: string;
  secondary?: boolean | string;
  [x: string]: any;
}) => {
  const [darkmode, setDarkmode] = React.useState(false);
  
  React.useEffect(() => {
    // Safely access document only on the client-side
    if (typeof window !== 'undefined') {
      setDarkmode(document.body.classList.contains('dark'));
    }
  }, []);

  // Central navigation links data
  const navLinks = [
    { href: "/customer/default", text: "Home" },
    { href: "/customer/catalog", text: "Katalog" },
    { href: "/customer/activities", text: "Aktivitas" },
    { href: "/customer/about", text: "About" },
  ];

  return (
    <nav className="sticky top-4 z-40 flex flex-wrap items-center justify-between rounded-xl bg-white px-4 py-2 shadow-lg mx-2 dark:bg-navy-800">
      
      {/* Left side: Logo and Desktop Nav Links */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <NavLink href="/customer/default">
          <img src={Logo.src} alt="Logo" className="h-12 w-auto" />
        </NavLink>
        
        {/* Desktop Navigation Links - Hidden on mobile */}
        <div className="hidden xl:flex items-center space-x-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              className="text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white"
            >
              {link.text}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Right side: Icons and Mobile Menu */}
      <div className="flex items-center gap-4">

        {/* Desktop Search Bar - Hidden on mobile */}
        <div className="hidden sm:flex">
          <SearchComponent />
        </div>

        {/* Notification Icon */}
        <Dropdown
          button={
            <p className="cursor-pointer">
              <IoMdNotificationsOutline className="h-7 w-7 text-gray-600 dark:text-white" />
            </p>
          }
          animation="origin-top-right transition-all duration-300 ease-in-out"
          classNames={'py-2 top-4 -right-10 md:-right-2 w-max'}
        >
          {/* ... Your Notification content ... */}
          <div className="flex w-[320px] flex-col gap-3 rounded-[20px] bg-white p-4 shadow-xl dark:!bg-navy-700 dark:text-white sm:w-[400px]">
            <p className="font-bold">Notifications</p>
            {/* Add notification items here */}
          </div>
        </Dropdown>
        
        {/* User Button */}
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: 'h-10 w-10',
            },
          }}
        />

        {/* Mobile Menu (Hamburger) - Hidden on desktop */}
        <div className="flex xl:hidden">
          <Dropdown
            button={
              <span className="cursor-pointer text-xl text-gray-600 dark:text-white">
                <FiAlignJustify className="h-7 w-7" />
              </span>
            }
            animation="origin-top-right transition-all duration-300 ease-in-out"
            classNames={'py-2 top-4 -right-2 w-max'}
          >
            <div className="flex w-[280px] flex-col gap-2 rounded-[20px] bg-white p-4 shadow-xl dark:!bg-navy-700 dark:text-white">
              {/* Mobile Search Bar */}
              <div className="mb-2 sm:hidden">
                  <SearchComponent placeholder="Search..." />
              </div>

              {/* Mobile Navigation Links */}
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 dark:text-white dark:hover:bg-navy-600 rounded-lg transition-colors"
                >
                  {link.text}
                </NavLink>
              ))}
            </div>
          </Dropdown>
        </div>
      </div>
    </nav>
  );
};

export default NavbarCustomer;