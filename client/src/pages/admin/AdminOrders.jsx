import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Loading from '../../components/Loading';
import { formatCurrencyFromUsd } from '../../utils/currency';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setNotification({ type: 'success', message: 'Order status updated successfully!' });
      fetchOrders();
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error updating order status:', error);
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to update order status' 
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  if (loading) return <Loading message="Loading orders..." />;

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">📋 Manage Orders</h1>

      {notification && (
        <div className={`mb-6 p-4 rounded-lg border ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-300 text-green-800' 
            : 'bg-red-50 border-red-300 text-red-800'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="font-mono text-sm text-blue-600 hover:text-blue-700"
                      >
                        #{order._id.slice(-8)}
                      </Link>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{order.user?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{order.user?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-900">
                        <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-gray-900">{formatCurrencyFromUsd(order.totalPrice)}</p>
                        <p className={`text-xs ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                          {order.isPaid ? '✓ Paid' : '⏳ Unpaid'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="px-3 py-1 bg-gray-50 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                          title="View Details"
                        >
                          👁️
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg shadow-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
          <p className="text-sm text-blue-700">Total Orders</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg shadow-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-900">
            {orders.filter(o => o.status === 'pending').length}
          </p>
          <p className="text-sm text-yellow-700">Pending</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg shadow-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-900">
            {orders.filter(o => o.status === 'processing').length}
          </p>
          <p className="text-sm text-orange-700">Processing</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-lg shadow-lg p-4 text-center">
          <p className="text-2xl font-bold text-cyan-900">
            {orders.filter(o => o.status === 'shipped').length}
          </p>
          <p className="text-sm text-cyan-700">Shipped</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg shadow-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-900">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
          <p className="text-sm text-green-700">Delivered</p>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
