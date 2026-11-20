import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const { currentUser } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await productService.getFeaturedProducts();
        setFeaturedProducts(products.slice(0, 8));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (currentUser?.role === 'admin') {
    window.location.href = '/admin';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Our Store</h1>
          <p className="text-xl mb-8">Discover amazing products at great prices</p>
          <Link 
            to="/products" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Featured Products */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link 
            to="/products" 
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            View All Products →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

