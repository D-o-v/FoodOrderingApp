import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { getAllUsers, setUserType } from './api';
import { toast } from 'react-toastify';

function UserManagement() {
  const [users, setUsers] = useState<any>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const handleUserTypeChange = async (username:any, newType:any) => {
    try {
      await setUserType(username, newType);
      toast.success('User type updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user type');
    }
  };

  const columns = [
    {
      name: 'Username',
      selector: (row:any ) => row.username,
      sortable: true,
    },
    {
      name: 'User Type',
      selector: (row:any ) => row.type,
      sortable: true,
      cell: (row:any )=> (
        <select
          value={row.type}
          onChange={(e) => handleUserTypeChange(row.username, e.target.value)}
          className="bg-white border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <DataTable
        columns={columns}
        data={users}
        pagination
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        paginationPerPage={25}
      />
    </div>
  );
}

export default UserManagement;