// components/sidebar/components/Links.tsx
import React, { JSX, useState } from 'react';
import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import NavLink from 'components/link/NavLink';
import DashIcon from 'components/icons/DashIcon';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { IRoute } from 'types/navigation';

export const SidebarLinks = (props: { routes: IRoute[] }): JSX.Element => {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const { routes } = props;

  const activeRoute = useCallback(
    (routeName: string) => {
      return pathname?.includes(routeName);
    },
    [pathname],
  );

  const toggleSubMenu = (routePath: string) => {
    setExpandedMenus(prev => 
      prev.includes(routePath) 
        ? prev.filter(path => path !== routePath)
        : [...prev, routePath]
    );
  };

  const handleMenuClick = (route: IRoute) => {
    if (route.subRoutes && route.subRoutes.length > 0) {
      // If it has sub-routes, toggle the submenu and redirect to first sub-route
      toggleSubMenu(route.path);
      // Redirect to first sub-route (schedule in this case)
      const firstSubRoute = route.subRoutes[0];
      router.push(route.layout + '/' + firstSubRoute.path);
    }
  };

  const createLinks = (routes: IRoute[]) => {
    return routes.map((route, index) => {
      if (
        route.layout === '/admin' ||
        route.layout === '/owner' ||
        route.layout === '/auth'
      ) {
        const hasSubRoutes = route.subRoutes && route.subRoutes.length > 0;
        const isExpanded = expandedMenus.includes(route.path);
        const isParentActive = hasSubRoutes && route.subRoutes.some(subRoute => 
          activeRoute(subRoute.path)
        );

        return (
          <div key={index}>
            {/* Main menu item */}
            {hasSubRoutes ? (
              <div
                className="relative mb-3 flex hover:cursor-pointer"
                onClick={() => handleMenuClick(route)}
              >
                <li className="my-[3px] flex w-full cursor-pointer items-center px-8">
                  <span
                    className={`${
                      isParentActive || activeRoute(route.path)
                        ? 'font-bold text-brand-500 dark:text-white'
                        : 'font-medium text-gray-600'
                    }`}
                  >
                    {route.icon ? route.icon : <DashIcon />}
                  </span>
                  <p
                    className={`leading-1 ml-4 flex flex-1 ${
                      isParentActive || activeRoute(route.path)
                        ? 'font-bold text-navy-700 dark:text-white'
                        : 'font-medium text-gray-600'
                    }`}
                  >
                    {route.name}
                  </p>
                  <span className="ml-auto">
                    {isExpanded ? (
                      <FaChevronUp className="h-4 w-4 fill-gray-600 " />
                    ) : (
                      <FaChevronDown className="h-4 w-4 fill-gray-600" />
                    )}
                  </span>
                </li>
                {(isParentActive || activeRoute(route.path)) && (
                  <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500 dark:bg-brand-400" />
                )}
              </div>
            ) : (
              <NavLink href={route.layout + '/' + route.path}>
                <div className="relative mb-3 flex hover:cursor-pointer">
                  <li className="my-[3px] flex cursor-pointer items-center px-8">
                    <span
                      className={`${
                        activeRoute(route.path) === true
                          ? 'font-bold text-brand-500 dark:text-white'
                          : 'font-medium text-gray-600'
                      }`}
                    >
                      {route.icon ? route.icon : <DashIcon />}
                    </span>
                    <p
                      className={`leading-1 ml-4 flex ${
                        activeRoute(route.path) === true
                          ? 'font-bold text-navy-700 dark:text-white'
                          : 'font-medium text-gray-600'
                      }`}
                    >
                      {route.name}
                    </p>
                  </li>
                  {activeRoute(route.path) ? (
                    <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500 dark:bg-brand-400" />
                  ) : null}
                </div>
              </NavLink>
            )}

            {/* Sub-menu items */}
            {hasSubRoutes && isExpanded && (
              <div className="mx-4 mb-3 rounded-lg bg-gray-50 py-2 dark:bg-navy-700">
                {route.subRoutes.map((subRoute, subIndex) => (
                  <NavLink
                    key={subIndex}
                    href={route.layout + '/' + subRoute.path}
                  >
                    <div className="relative mx-2 my-1 flex rounded-md hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-navy-600">
                      <li className="flex w-full cursor-pointer items-center px-4 py-2">
                        <span
                          className={`${
                            activeRoute(subRoute.path) === true
                              ? 'text-brand-500 dark:text-white'
                              : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {subRoute.icon ? subRoute.icon : <DashIcon />}
                        </span>
                        <p
                          className={`leading-1 ml-3 flex text-sm ${
                            activeRoute(subRoute.path) === true
                              ? 'font-semibold text-navy-700 dark:text-white'
                              : 'font-medium text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {subRoute.name}
                        </p>
                      </li>
                      {activeRoute(subRoute.path) && (
                        <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 transform rounded-r-lg bg-brand-500 dark:bg-brand-400" />
                      )}
                    </div>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      }
    });
  };

  return <>{createLinks(routes)}</>;
};

export default SidebarLinks;