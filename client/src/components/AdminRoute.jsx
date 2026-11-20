import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role
  if (currentUser?.role !== 'admin') {
    return (
      <div className="container py-12 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
        <a href="/" className="btn btn-primary">Go to Home</a>
      </div>
    );
  }

  return children;
};

export default AdminRoute;

