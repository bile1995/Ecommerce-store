import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Loading from '../../components/Loading';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      alert('User role updated successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(userId);
        alert('User deleted successfully!');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  if (loading) return <Loading message="Loading users..." />;

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">👥 Manage Users</h1>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">User</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Role</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Joined</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.picture || 'https://via.placeholder.com/40'}
                          alt={user.name}
                          className="w-10 h-10 rounded-full border-2 border-gray-300"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/40?text=' + user.name.charAt(0);
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500 font-mono">{user._id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-900">{user.email}</td>
                    <td className="py-4 px-6">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className={`py-1 px-3 text-sm font-semibold rounded border focus:outline-none ${
                          user.role === 'admin'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-gray-100 text-gray-800 border-gray-300'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
            </div>
            <div className="bg-blue-200/50 p-4 rounded-full">
              <span className="text-4xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Admins</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="bg-purple-200/50 p-4 rounded-full">
              <span className="text-4xl">👑</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Regular Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {users.filter(u => u.role === 'user').length}
              </p>
            </div>
            <div className="bg-teal-200/50 p-4 rounded-full">
              <span className="text-4xl">👤</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
