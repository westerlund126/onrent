// File: src/hooks/useRoleRoutes.ts

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { getRoutesByRole, IRoute } from 'routes';

export const useRoleRoutes = (): IRoute[] => {
  const pathname = usePathname();
  
  const currentRole = useMemo(() => {
    // Extract role from pathname
    if (pathname.startsWith('/admin')) {
      return 'admin';
    } else if (pathname.startsWith('/owner')) {
      return 'owner';
    } else if (pathname.startsWith('/customer')) {
      return 'customer';
    }
    
    // Default fallback
    return 'owner';
  }, [pathname]);
  
  return getRoutesByRole(currentRole);
};

// Alternative hook if you have user context/auth
export const useRoleRoutesWithAuth = (userRole?: string): IRoute[] => {
  const pathname = usePathname();
  
  const routes = useMemo(() => {
    // Priority 1: Use provided user role
    if (userRole) {
      return getRoutesByRole(userRole);
    }
    
    // Priority 2: Extract from pathname
    if (pathname.startsWith('/admin')) {
      return getRoutesByRole('admin');
    } else if (pathname.startsWith('/owner')) {
      return getRoutesByRole('owner');
    } else if (pathname.startsWith('/customer')) {
      return getRoutesByRole('customer');
    }
    
    // Default fallback
    return getRoutesByRole('owner');
  }, [userRole, pathname]);
  
  return routes;
};