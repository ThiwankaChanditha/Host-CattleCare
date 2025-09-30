import React, { useState, useEffect } from 'react';
import { Search, Plus, SquarePen } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');


  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 15;
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Map userType abbreviations to full role names
        const roleMap = {
          'ADG': 'Assitant Director General(ADG)',
          'PD': 'Provincial Director (PD)',
          'VS': 'Veterinary Surgeon (VS)',
          'RD': 'Regional Director (RD)',
          'LDI': 'LDI Officer',
          'Farmer': 'Farmer',
          // Removed 'PD' and 'RD' as they are not in backend roles
        };
        const mappedRole = userType === 'all' ? '' : (roleMap[userType] || userType);
        const roleParam = mappedRole ? `role=${encodeURIComponent(mappedRole)}` : '';
        const statusParam = statusFilter === 'all' ? '' : `status=${statusFilter}`;
        let queryParams = '';
        if (roleParam && statusParam) {
          queryParams = `?${roleParam}&${statusParam}`;
        } else if (roleParam) {
          queryParams = `?${roleParam}`;
        } else if (statusParam) {
          queryParams = `?${statusParam}`;
        }
        const response = await axios.get(`http://localhost:5000/api/admin/users${queryParams}`);
        setUsers(response.data.data); // assuming response structure is { data: { data: [...] } }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [userType, statusFilter]);
  const filteredUsers = users; // Remove frontend filtering as backend handles it now

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
      <button
        id="addUserButton"
        name="addUserButton"
        className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500"
        onClick={() => navigate('/sysadmin/add-user')}
      >
        <Plus size={18} className="mr-1" />
        Add User
      </button>

    </div>
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-4 justify-between">
          <div className="flex items-center space-x-2">


          </div>

          <div className="flex space-x-1">
            <button onClick={() => setUserType('all')} className={`px-3 py-1 rounded-md ${userType === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
              All
            </button>
            <button onClick={() => setUserType('ADG')} className={`px-3 py-1 rounded-md ${userType === 'ADG' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
              ADG
            </button>
            <button onClick={() => setUserType('PD')} className={`px-3 py-1 rounded-md ${userType === 'PD' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
              PD
            </button>
            <button onClick={() => setUserType('RD')} className={`px-3 py-1 rounded-md ${userType === 'RD' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
              RD
            </button>
            <button onClick={() => setUserType('LDI')} className={`px-3 py-1 rounded-md ${userType === 'LDI' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
              LDI
            </button>
            <button onClick={() => setUserType('VS')} className={`px-3 py-1 rounded-md ${userType === 'VS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
              VS
            </button>
            <button onClick={() => setUserType('Farmer')} className={`px-3 py-1 rounded-md ${userType === 'Farmer' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
              Farmer
            </button>

            <div className="flex items-center space-x-3 ">
              <label htmlFor="statusFilter" className="text-md font-medium text-gray-700">Status:</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1"
              >
                <option value="all">All</option>
                <option value="active">Active</option>

                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

        </div>

      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>

              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>

              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Province
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                District
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                VS Division
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LDI Division
              </th>

              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                E mail
              </th>

              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NIC
              </th>
              <th scope="col" className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Edit
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.map(user => <tr key={user._id || user.id || user.sid}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">
                    {user.full_name}
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user.role_id ? user.role_id.role_name : ''}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.province}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.district}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.vsDivision}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.ldiDivision}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.nic}
              </td>


              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex space-x-2 justify-end">
                  <button className="text-blue-600 hover:text-blue-900" onClick={() => navigate(`/sysadmin/edit-user/${user._id}`)}>
                    <SquarePen size={18} />
                  </button>
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
          <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{' '}
          <span className="font-medium">{filteredUsers.length}</span> results
        </div>
        <div className="flex space-x-2">
          <button
            className={`border border-gray-300 rounded-md px-3 py-1 text-sm font-medium ${currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className={`border border-gray-300 rounded-md px-3 py-1 text-sm font-medium ${currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>;
};

export default UserManagement;