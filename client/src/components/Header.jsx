import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, currentUser, logout } = useAuth();
  const { getCartItemsCount } = useCart();

  const isAdmin = currentUser?.role === 'admin';
  const isAdminPage = location.pathname.startsWith('/admin');

  const handleLogin = () => navigate('/login');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-purple-900 to-purple-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container px-4">
        <div className="flex justify-between items-center py-3 md:py-4 gap-2 md:gap-8">
          <Link to="/" className="text-white no-underline hover:opacity-80 transition-opacity">
            <h1 className="text-xl md:text-3xl font-bold m-0">🛍️ E-store</h1>
          </Link>

          <nav className="flex items-center gap-2 md:gap-4 lg:gap-6">
            {/* Show navigation based on user role and page */}
            {!isAdmin && (
              <>
                <Link to="/" className="text-white no-underline font-medium hover:opacity-80 transition-opacity px-2 py-2 rounded-lg hover:bg-white/10 text-sm md:text-base">
                  Home
                </Link>
                <Link to="/products" className="text-white no-underline font-medium hover:opacity-80 transition-opacity px-2 py-2 rounded-lg hover:bg-white/10 text-sm md:text-base">
                  Products
                </Link>

                {/* Shopping Cart */}
                {isAuthenticated && (
                  <Link
                    to="/cart"
                    className="relative text-white no-underline hover:opacity-80 transition-all group"
                    title="Shopping Cart"
                  >
                    <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-lg hover:bg-white/10 transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 md:h-6 md:w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span className="font-medium hidden sm:inline text-sm md:text-base">Cart</span>
                      {getCartItemsCount() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-xs font-bold animate-pulse">
                          {getCartItemsCount()}
                        </span>
                      )}
                    </div>
                  </Link>
                )}
              </>
            )}

            {isAuthenticated ? (
              <>
                {!isAdmin && (
                  <>
                    <Link to="/orders" className="text-white no-underline font-medium hover:opacity-80 transition-opacity px-2 md:px-3 py-2 rounded-lg hover:bg-white/10 text-sm md:text-base hidden sm:inline-block">
                      Orders
                    </Link>
                    <Link to="/profile" className="text-white no-underline font-medium hover:opacity-80 transition-opacity px-2 md:px-3 py-2 rounded-lg hover:bg-white/10 text-sm md:text-base hidden sm:inline-block">
                      Profile
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="px-3 md:px-6 py-1.5 md:py-2 bg-white/20 text-white border border-white rounded-lg font-semibold hover:bg-white/30 transition-all text-sm md:text-base"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="px-3 md:px-6 py-1.5 md:py-2 bg-white text-purple-700 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm md:text-base"
              >
                Login
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

