// components/UsersTable.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  MdKeyboardArrowDown,
  MdRefresh,
} from 'react-icons/md';
import Card from 'components/card';
import { useAdminUserStore, User, UserFilters } from 'stores/useAdminUserStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface RoleChangeConfirmation {
  isOpen: boolean;
  userId: number | null;
  username: string | null;
  currentRole: string | null;
  newRole: string | null;
}

interface UsersTableProps {
  filters?: UserFilters;
}

const getFullName = (user: User) => {
  return user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
};

const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'CUSTOMER':
      return 'Customer';
    case 'OWNER':
      return 'Owner';
    default:
      return role;
  }
};

const UsersTable: React.FC<UsersTableProps> = ({ filters = {} }) => {
  const {
    users,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    roleUpdateLoading,
    
    setCurrentPage,
    setFilters,
    loadUsers,
    updateUserRole,
    refreshData,
  } = useAdminUserStore();

  const [roleChangeConfirmation, setRoleChangeConfirmation] = 
    useState<RoleChangeConfirmation>({
      isOpen: false,
      userId: null,
      username: null,
      currentRole: null,
      newRole: null,
    });

  const itemsPerPage = filters.limit || 10;

  const defaultFilters: UserFilters = useMemo(() => ({
  roles: ['CUSTOMER', 'OWNER'],
  limit: 10,
}), []);

useEffect(() => {
  const storeFilters = useAdminUserStore.getState().filters;
  const areFiltersEqual =
    JSON.stringify(storeFilters) === JSON.stringify(defaultFilters);
  if (!areFiltersEqual) {
    setFilters(defaultFilters);
  }
}, [defaultFilters, setFilters]);

useEffect(() => {
  loadUsers(); // will only run after filter is set correctly
}, []);

  const handleRoleChange = (user: User, newRole: string) => {
    if (newRole === user.role) return;
    
    setRoleChangeConfirmation({
      isOpen: true,
      userId: user.id,
      username: user.username,
      currentRole: user.role,
      newRole: newRole,
    });
  };

  const confirmRoleChange = async () => {
    if (!roleChangeConfirmation.userId || !roleChangeConfirmation.newRole) return;
    
    await updateUserRole(roleChangeConfirmation.userId, roleChangeConfirmation.newRole);
    cancelRoleChange();
  };

  const cancelRoleChange = () => {
    setRoleChangeConfirmation({
      isOpen: false,
      userId: null,
      username: null,
      currentRole: null,
      newRole: null,
    });
  };

  if (loading) {
    return (
      <Card extra="w-full pb-10 p-4 h-full">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-lg font-medium text-gray-600">
              Loading users...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card extra="w-full pb-10 p-4 h-full">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-lg font-medium text-red-500">
              Error: {error}
            </p>
            <button
              onClick={refreshData}
              className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card extra="w-full h-full">
      <header className="relative flex items-center justify-between px-4 pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Managemen Pengguna
        </div>
        <Button
          onClick={refreshData}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Refresh Table"
        >
          <MdRefresh className="h-4 w-4" />
        </Button>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Username
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Nama Lengkap
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                <div className="flex items-center">
                  Role
                  <MdKeyboardArrowDown className="ml-1" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 transition-colors hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <span className="font-semibold text-secondary-500">
                    {user.username}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-secondary-500">
                  {getFullName(user)}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user, value)}
                    disabled={roleUpdateLoading === user.id}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUSTOMER" className="text-blue-600">
                        Customer
                      </SelectItem>
                      <SelectItem value="OWNER" className="text-green-600">
                        Owner
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {roleUpdateLoading === user.id && (
                    <div className="mt-1 text-xs text-blue-600">
                      Updating...
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239"
                />
              </svg>
            </div>
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} –{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{' '}
            users
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <AlertDialog open={roleChangeConfirmation.isOpen} onOpenChange={(open) => !open && cancelRoleChange()}>
          <AlertDialogOverlay className="bg-black fixed inset-0 z-50 backdrop-blur-sm backdrop-contrast-50" />
          <AlertDialogContent className='bg-white'>
            <AlertDialogHeader>
              <AlertDialogTitle>Ubah Role?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin mengubah {roleChangeConfirmation.username} role dari {getRoleDisplayName(roleChangeConfirmation.currentRole!)} menjadi {getRoleDisplayName(roleChangeConfirmation.newRole!)}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={confirmRoleChange}>Ya</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </Card>
  );
};

export default UsersTable;