'use client';
import UsersTable from 'components/admin/data-tables/UsersTable';

const Users = () => {
  return (
    <div>
      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-1">
        <UsersTable />
      </div>
    </div>
  );
};

export default Users;
