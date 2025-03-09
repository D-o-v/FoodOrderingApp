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
      // cell: (row:any )=> (
      //   <select
      //     value={row.type}
      //     onChange={(e) => handleUserTypeChange(row.username, e.target.value)}
      //     className="bg-white border border-gray-300 rounded-md shadow-sm p-2"
      //   >
      //     <option value="user">User</option>
      //     <option value="admin">Admin</option>
      //   </select>
      // ),
      cell: (row:any) => (
        <select
          value={row.type}
          onChange={(e) => handleUserTypeChange(row.username, e.target.value)}
          className="bg-white/70 border border-orange-200 rounded-lg shadow-sm p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 to-orange-600 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-xl bg-white/20 rounded-2xl shadow-xl border border-white/30 p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white drop-shadow-md">User Management</h2>
            <p className="text-white/80 mt-2">Manage user roles and permissions</p>
          </div>
  
          <div className="bg-white/30 backdrop-blur-sm rounded-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={users}
              pagination
              highlightOnHover
              customStyles={{
                headRow: {
                  style: {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'black',
                    fontWeight: 'bold',
                    '&:hover': {
                      cursor: 'pointer',
                    },
                  },
                },
                rows: {
                  style: {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'black',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    },
                  },
                },
                pagination: {
                  style: {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  },
                  pageButtonsStyle: {
                    color: 'white',
                    fill: 'white',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;