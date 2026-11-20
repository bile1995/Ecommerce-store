import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { formatCurrencyFromUsd } from '../utils/currency';
import Loading from '../components/Loading';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <Loading message="Loading orders..." />;

  return (
    <div className="py-12 min-h-screen">
      <div className="container">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">My Orders</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl text-gray-600 mb-4">No orders yet</h2>
            <Link to="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-mono font-semibold">{order._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-primary-500">
                      {formatCurrencyFromUsd(order.totalPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Items ({order.orderItems.length})</p>
                  <div className="space-y-2">
                    {order.orderItems.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <img 
                          src={item.image || item.product?.image || 'https://via.placeholder.com/150?text=No+Image'} 
                          alt={item.name || item.product?.name || 'Product'}
                          className="w-12 h-12 object-cover rounded border-2 border-gray-200"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name || item.product?.name || 'Product'}</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">{formatCurrencyFromUsd(item.price * item.quantity)}</p>
                      </div>
                    ))}
                    {order.orderItems.length > 3 && (
                      <p className="text-sm text-gray-600">
                        +{order.orderItems.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link 
                    to={`/orders/${order._id}`}
                    className="btn btn-primary flex-1 text-center"
                  >
                    View Details
                  </Link>
                  {order.status === 'delivered' && (
                    <button className="btn btn-secondary">
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

