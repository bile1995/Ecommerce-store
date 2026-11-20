import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />

                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />

                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } />

                <Route path="/orders/:id" element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                } />

                <Route path="/order-success/:orderId" element={
                  <ProtectedRoute>
                    <OrderSuccess />
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />

                <Route path="/admin/products" element={
                  <AdminRoute>
                    <AdminProducts />
                  </AdminRoute>
                } />

                <Route path="/admin/orders" element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                } />

                <Route path="/admin/users" element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                } />

                <Route path="/admin/orders/:id" element={
                  <AdminRoute>
                    <OrderDetail />
                  </AdminRoute>
                } />

                <Route path="/admin/settings" element={
                  <AdminRoute>
                    <AdminSettings />
                  </AdminRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
