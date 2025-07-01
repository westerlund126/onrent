// File: src/components/RouteDebugger.tsx

'use client';
import { useRoleRoutes } from 'hooks/useRoleRoutes';
import { usePathname } from 'next/navigation';

export default function RouteDebugger() {
  const pathname = usePathname();
  const routes = useRoleRoutes();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-sm mb-2">Route Debug Info</h3>
      <div className="text-xs">
        <p><strong>Current Path:</strong> {pathname}</p>
        <p><strong>Detected Role:</strong> {
          pathname.startsWith('/admin') ? 'admin' : 
          pathname.startsWith('/owner') ? 'owner' : 
          pathname.startsWith('/customer') ? 'customer' : 'unknown'
        }</p>
        <p><strong>Routes Count:</strong> {routes.length}</p>
        <p><strong>Route Layouts:</strong></p>
        <ul className="ml-2">
          {routes.map((route, index) => (
            <li key={index}>• {route.layout}/{route.path}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}