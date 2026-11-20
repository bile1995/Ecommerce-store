import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { formatCurrencyFromUsd } from '../utils/currency';
import Loading from '../components/Loading';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      navigate('/');
    }
  }, [orderId, navigate]);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getOrder(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading order details..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🎉 Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase! Your order has been received and is being processed.
          </p>

          {/* Order Details */}
          {order && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-mono font-semibold">{order._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-primary-500">{formatCurrencyFromUsd(order.totalPrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <p className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.isPaid ? 'Paid' : 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Status</p>
                  <p className="font-semibold text-blue-600 capitalize">{order.status}</p>
                </div>
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">What happens next?</h3>
            <div className="text-left space-y-2 text-gray-600">
              <p>✅ Order confirmation email sent</p>
              <p>📦 Your order is being prepared</p>
              <p>🚚 You'll receive tracking information once shipped</p>
              <p>📱 Track your order status in your account</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to={`/orders/${orderId}`}
              className="btn btn-primary flex-1"
            >
              View Order Details
            </Link>
            <Link 
              to="/orders"
              className="btn btn-secondary flex-1"
            >
              View All Orders
            </Link>
            <Link 
              to="/products"
              className="btn btn-outline flex-1"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;