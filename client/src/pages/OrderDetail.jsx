import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { formatCurrencyFromUsd } from '../utils/currency';
import Loading from '../components/Loading';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminView = location.pathname.includes('/admin');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrder(id);
      setOrder(data);
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

  if (loading) return <Loading message="Loading order..." />;
  if (error) return <div className="container py-12 text-center text-red-500 text-lg">{error}</div>;
  if (!order) return <div className="container py-12 text-center text-gray-500 text-lg">Order not found</div>;

  return (
    <div className={`py-12 min-h-screen ${isAdminView ? 'bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900' : ''}`}>
      <div className="container max-w-5xl">
        <button 
          onClick={() => navigate(isAdminView ? '/admin/orders' : '/orders')}
          className="mb-6 text-primary-500 hover:text-primary-600 font-medium flex items-center gap-2"
        >
          ← Back to {isAdminView ? 'Admin Orders' : 'Orders'}
        </button>

        <div className={`${isAdminView ? 'bg-purple-800/50 backdrop-blur-sm border border-purple-700' : 'bg-white'} rounded-xl shadow-md p-8 mb-6`}>
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isAdminView ? 'text-white' : 'text-gray-800'}`}>
                {isAdminView ? '👑 Admin Order View' : 'Order Details'}
              </h1>
              <p className={isAdminView ? 'text-purple-200' : 'text-gray-600'}>
                Order ID: <span className="font-mono font-semibold">{order._id}</span>
              </p>
              <p className={isAdminView ? 'text-purple-200' : 'text-gray-600'}>
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-lg font-semibold ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          {/* Order Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {['pending', 'processing', 'shipped', 'delivered'].map((status, index) => {
                const statusIndex = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status);
                const isActive = index <= statusIndex;
                const isCancelled = order.status === 'cancelled';
                
                return (
                  <div key={status} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        isCancelled ? 'bg-red-500 text-white' : isActive ? 'bg-primary-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {isActive ? '✓' : index + 1}
                      </div>
                      <p className="text-xs mt-2 text-center capitalize">{status}</p>
                    </div>
                    {index < 3 && (
                      <div className={`h-1 flex-1 ${isActive && !isCancelled ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h2 className={`text-xl font-bold mb-3 ${isAdminView ? 'text-white' : 'text-gray-800'}`}>Shipping Address</h2>
            <div className={`${isAdminView ? 'bg-purple-700/30 border border-purple-600' : 'bg-gray-50'} rounded-lg p-4`}>
              <p className={`font-medium ${isAdminView ? 'text-purple-100' : 'text-gray-800'}`}>{order.shippingAddress.address}</p>
              <p className={isAdminView ? 'text-purple-200' : 'text-gray-600'}>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p className={isAdminView ? 'text-purple-200' : 'text-gray-600'}>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h2 className={`text-xl font-bold mb-3 ${isAdminView ? 'text-white' : 'text-gray-800'}`}>Payment Method</h2>
            <div className={`${isAdminView ? 'bg-purple-700/30 border border-purple-600' : 'bg-gray-50'} rounded-lg p-4`}>
              <p className={`font-medium capitalize ${isAdminView ? 'text-purple-100' : 'text-gray-800'}`}>{order.paymentMethod.replace('_', ' ')}</p>
              <p className={`text-sm font-semibold ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.isPaid ? 'Paid' : 'Not paid yet'}
              </p>

            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h2 className={`text-xl font-bold mb-3 ${isAdminView ? 'text-white' : 'text-gray-800'}`}>Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={index} className={`flex items-center gap-4 ${isAdminView ? 'bg-purple-700/30 border border-purple-600' : 'bg-gray-50'} rounded-lg p-4`}>
                  <img 
                    src={item.image || item.product?.image || 'https://via.placeholder.com/150?text=No+Image'} 
                    alt={item.name || item.product?.name || 'Product'}
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                  />
                  <div className="flex-1">
                    <p className={`font-semibold text-lg ${isAdminView ? 'text-purple-100' : 'text-gray-800'}`}>{item.name || item.product?.name || 'Product'}</p>
                    <p className={isAdminView ? 'text-purple-200' : 'text-gray-600'}>Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${isAdminView ? 'text-purple-200' : 'text-gray-600'}`}>{formatCurrencyFromUsd(item.price)} each</p>
                    <p className="text-xl font-bold text-primary-500">
                      {formatCurrencyFromUsd(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-6">
            <h2 className={`text-xl font-bold mb-4 ${isAdminView ? 'text-white' : 'text-gray-800'}`}>Order Summary</h2>
            <div className="space-y-2 max-w-md ml-auto">
              <div className={`flex justify-between ${isAdminView ? 'text-purple-200' : 'text-gray-600'}`}>
                <span>Items Price</span>
                <span>{formatCurrencyFromUsd(order.itemsPrice)}</span>
              </div>
              <div className={`flex justify-between ${isAdminView ? 'text-purple-200' : 'text-gray-600'}`}>
                <span>Tax</span>
                <span>{formatCurrencyFromUsd(order.taxPrice)}</span>
              </div>
              <div className={`flex justify-between ${isAdminView ? 'text-purple-200' : 'text-gray-600'}`}>
                <span>Shipping</span>
                <span>{formatCurrencyFromUsd(order.shippingPrice)}</span>
              </div>
              <div className={`border-t pt-2 flex justify-between text-2xl font-bold ${isAdminView ? 'text-white border-purple-600' : 'text-gray-800'}`}>
                <span>Total</span>
                <span className="text-primary-500">{formatCurrencyFromUsd(order.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

