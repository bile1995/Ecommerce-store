import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { userService } from '../../services/userService';
import Loading from '../../components/Loading';
import { formatCurrencyFromUsd } from '../../utils/currency';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes] = await Promise.all([
        adminService.getAllOrders(),
        productService.getProducts({ limit: 100 }),
      ]);

      const orders = ordersRes;
      const products = productsRes.products || [];

      const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
      const recentOrders = orders.slice(0, 5);

      setStats({
        totalOrders: orders.length,
        totalProducts: products.length,
        totalRevenue,
        recentOrders,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">👑 Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
            </div>
            <div className="bg-blue-200/50 p-4 rounded-full">
              <span className="text-4xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl shadow-lg p-6 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
            </div>
            <div className="bg-teal-200/50 p-4 rounded-full">
              <span className="text-4xl">🛍️</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-lg p-6 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrencyFromUsd(stats.totalRevenue)}</p>
            </div>
            <div className="bg-emerald-200/50 p-4 rounded-full">
              <span className="text-4xl\">💰</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/admin/products"
          className="bg-white rounded-xl shadow-lg p-6 border border-blue-200 hover:shadow-xl hover:border-blue-400 transition-all text-center no-underline"
        >
          <span className="text-5xl mb-3 block">📦</span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Products</h3>
          <p className="text-gray-600">Add, edit, or remove products</p>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white rounded-xl shadow-lg p-6 border border-teal-200 hover:shadow-xl hover:border-teal-400 transition-all text-center no-underline"
        >
          <span className="text-5xl mb-3 block">📋</span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Orders</h3>
          <p className="text-gray-600">View and update order status</p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200 hover:shadow-xl hover:border-emerald-400 transition-all text-center no-underline"
        >
          <span className="text-5xl mb-3 block">👥</span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Users</h3>
          <p className="text-gray-600">View and manage user accounts</p>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Orders</h2>
        {stats.recentOrders.length === 0 ? (
          <p className="text-gray-600">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Order ID</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Customer</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Total</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm text-gray-900">{order._id.slice(-8)}</td>
                    <td className="py-3 px-4 text-gray-900">{order.user?.name || order.user?.email || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-900">{formatCurrencyFromUsd(order.totalPrice)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800 border border-green-300' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                        'bg-gray-100 text-gray-800 border border-gray-300'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
