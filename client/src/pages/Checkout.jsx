import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { userService } from '../services/userService';
import { formatCurrencyFromUsd } from '../utils/currency';
import Loading from '../components/Loading';

const Checkout = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cart, loading: cartLoading, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
    paymentMethod: 'mobile_banking',
    deliveryOption: 'standard',
  });
  
  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);
  
  const fetchUserProfile = async () => {
    try {
      const profile = await userService.getProfile();
      setFormData({
        address: profile.shippingAddress?.address || '',
        city: profile.shippingAddress?.city || '',
        postalCode: profile.shippingAddress?.postalCode || '',
        country: profile.shippingAddress?.country || '',
        phone: profile.phone || '',
        paymentMethod: 'mobile_banking',
        deliveryOption: 'standard',
      });
    } catch (err) {
      console.log('Could not load profile data');
    }
  };
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cart || cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Validate form
    if (!formData.address || !formData.city || !formData.postalCode || !formData.country || !formData.phone) {
      setError('Please fill in all shipping information');
      return;
    }

    // For mobile banking, show payment details
    if (formData.paymentMethod === 'mobile_banking') {
      setShowPayment(true);
      return;
    }

    // For cash, proceed directly
    await createOrder();
  };

  const handlePaymentSuccess = async (transactionId) => {
    const order = await createOrder(transactionId);
    if (order) {
      navigate(`/order-success/${order._id}`);
    }
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
  };

  const createOrder = async (paymentMethodId = null) => {
    try {
      setSubmitting(true);
      setError(null);

      const orderData = {
        orderItems: cart.items.map(item => {
          // Handle both populated product (MongoDB) and denormalized data (External API)
          const productId = item.product?._id || item.product;
          const productName = item.name || item.product?.name;
          const productImage = item.image || item.product?.image;
          
          return {
            product: productId,
            name: productName,
            image: productImage,
            quantity: item.quantity,
            price: item.price,
          };
        }),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        phone: formData.phone,
        paymentMethod: formData.paymentMethod,
        deliveryOption: formData.deliveryOption,
        paymentMethodId: paymentMethodId,
        itemsPrice: cart.totalPrice,
        taxPrice: cart.totalPrice * 0.1, // 10% tax
        shippingPrice: 0, // Free shipping
        totalPrice: cart.totalPrice + (cart.totalPrice * 0.1),
        isPaid: paymentMethodId ? true : formData.paymentMethod === 'cash',
      };

      const order = await orderService.createOrder(orderData);
      await clearCart();
      
      // For cash payments, navigate to success page
      if (formData.paymentMethod === 'cash') {
        navigate(`/order-success/${order._id}`);
      }
      
      return order;
    } catch (err) {
      setError(err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) return <Loading message="Loading..." />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl text-gray-600 mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/products')} className="btn btn-primary">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="py-12 min-h-screen">
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Shipping Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Shipping Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-gray-900 border-2 border-gray-300 rounded-lg focus:border-primary-500 outline-none"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-gray-900 border-2 border-gray-300 rounded-lg focus:border-primary-500 outline-none"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-gray-900 border-2 border-gray-300 rounded-lg focus:border-primary-500 outline-none"
                    placeholder="10001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-gray-900 border-2 border-gray-300 rounded-lg focus:border-primary-500 outline-none"
                    placeholder="USA"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-gray-900 border-2 border-gray-300 rounded-lg focus:border-primary-500 outline-none"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Option */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Delivery Option</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="standard"
                    checked={formData.deliveryOption === 'standard'}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <div>
                    <span className="font-medium text-gray-800 block">📦 Standard Delivery</span>
                    <span className="text-sm text-gray-600">3-5 business days</span>
                  </div>
                </div>
                <span className="text-green-600 font-semibold">FREE</span>
              </label>

              <label className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="express"
                    checked={formData.deliveryOption === 'express'}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <div>
                    <span className="font-medium text-gray-800 block">🚀 Express Delivery</span>
                    <span className="text-sm text-gray-600">1-2 business days</span>
                  </div>
                </div>
                <span className="text-gray-800 font-semibold">550.00 birr</span>
              </label>

              <label className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="same_day"
                    checked={formData.deliveryOption === 'same_day'}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <div>
                    <span className="font-medium text-gray-800 block">⚡ Same Day Delivery</span>
                    <span className="text-sm text-gray-600">Within 24 hours</span>
                  </div>
                </div>
                <span className="text-gray-800 font-semibold">1375.00 birr</span>
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Method</h2>

            {!showPayment ? (
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mobile_banking"
                    checked={formData.paymentMethod === 'mobile_banking'}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-medium text-gray-800">📱 Mobile Banking</span>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-medium text-gray-800">💵 Cash on Delivery</span>
                </label>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Mobile Banking Payment</h3>
                  <button
                    type="button"
                    onClick={() => setShowPayment(false)}
                    className="text-primary-500 hover:text-primary-600 font-medium"
                  >
                    ← Back
                  </button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                  <p className="text-gray-800 font-medium">Select Bank & Send Payment:</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-300 cursor-pointer hover:border-primary-500">
                      <input type="radio" name="bank" value="CBE" className="w-4 h-4" />
                      <div>
                        <p className="font-semibold text-gray-800">CBE Bank</p>
                        <p className="text-sm text-gray-600">Account: 1000032214723</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-300 cursor-pointer hover:border-primary-500">
                      <input type="radio" name="bank" value="Abyssinia" className="w-4 h-4" />
                      <div>
                        <p className="font-semibold text-gray-800">Abyssinia Bank</p>
                        <p className="text-sm text-gray-600">Account: 932812</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-300 cursor-pointer hover:border-primary-500">
                      <input type="radio" name="bank" value="Dashen" className="w-4 h-4" />
                      <div>
                        <p className="font-semibold text-gray-800">Dashen Bank</p>
                        <p className="text-sm text-gray-600">Account: 1223012938212</p>
                      </div>
                    </label>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-300">
                    <p className="text-sm text-gray-600">Amount to Pay</p>
                    <p className="text-2xl font-bold text-primary-500">{formatCurrencyFromUsd(cart.totalPrice + cart.totalPrice * 0.1)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID / Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your transaction ID"
                      className="w-full px-4 py-3 text-gray-900 border-2 border-gray-300 rounded-lg focus:border-primary-500 outline-none"
                      onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePaymentSuccess(formData.transactionId)}
                    disabled={!formData.transactionId}
                    className="w-full btn btn-primary py-3 disabled:opacity-50"
                  >
                    Confirm Payment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cart.items.map((item) => {
                const productImage = item.image || item.product?.image;
                const productName = item.name || item.product?.name;
                
                return (
                  <div key={item._id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-800">{productName}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-800">{formatCurrencyFromUsd(item.price * item.quantity)}</p>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrencyFromUsd(cart.totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>{formatCurrencyFromUsd(cart.totalPrice * 0.1)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-2xl font-bold text-gray-800">
                <span>Total</span>
                <span className="text-primary-500">{formatCurrencyFromUsd(cart.totalPrice + cart.totalPrice * 0.1)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {!showPayment && (
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing...' : formData.paymentMethod === 'mobile_banking' ? 'Continue to Payment' : 'Place Order'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Checkout;

