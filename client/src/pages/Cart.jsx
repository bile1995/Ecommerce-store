import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrencyFromUsd } from '../utils/currency';
import Loading from '../components/Loading';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, updateCartItem, removeFromCart } = useCart();

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (err) {
      alert(err.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (itemId) => {
    if (window.confirm('Remove this item from cart?')) {
      try {
        await removeFromCart(itemId);
      } catch (err) {
        alert(err.message || 'Failed to remove item');
      }
    }
  };

  if (loading) return <Loading message="Loading cart..." />;

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="py-12 min-h-screen">
      <div className="container">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

        {isEmpty ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl text-gray-600 mb-4">Your cart is empty</h2>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                // Handle both populated product (MongoDB) and denormalized data (External API)
                const productId = item.product?._id || item.product;
                const productName = item.name || item.product?.name;
                const productImage = item.image || item.product?.image;
                const productBrand = item.product?.brand || '';
                const productStock = item.product?.countInStock || 10;

                return (
                  <div key={item._id} className="bg-white rounded-xl shadow-md p-6 flex gap-6">
                    <Link to={`/products/${productId}`} className="flex-shrink-0">
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    </Link>

                    <div className="flex-1">
                      <Link
                        to={`/products/${productId}`}
                        className="text-xl font-semibold text-gray-800 hover:text-primary-500 no-underline"
                      >
                        {productName}
                      </Link>
                      {productBrand && <p className="text-gray-600 mt-1">{productBrand}</p>}
                      <p className="text-2xl font-bold text-primary-500 mt-2">
                        {formatCurrencyFromUsd(item.price)}
                      </p>

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">Qty:</label>
                          <select
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item._id, Number(e.target.value))}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 outline-none text-gray-900 font-semibold bg-white cursor-pointer"
                          >
                            {[...Array(Math.min(productStock, 10))].map((_, i) => (
                              <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => handleRemove(item._id)}
                          className="text-red-500 hover:text-red-600 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {formatCurrencyFromUsd(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({cart.items.reduce((acc, item) => acc + item.quantity, 0)})</span>
                    <span>{formatCurrencyFromUsd(cart.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-primary-500">{formatCurrencyFromUsd(cart.totalPrice)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full btn btn-primary text-lg py-4 mb-4"
                >
                  Proceed to Checkout
                </button>

                <Link 
                  to="/products"
                  className="block text-center text-primary-500 hover:text-primary-600 font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

