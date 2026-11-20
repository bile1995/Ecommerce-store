import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { formatCurrencyFromUsd } from '../utils/currency';
import Loading from '../components/Loading';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProduct(id);
      setProduct(data);
      setSelectedImage(data.image);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(product._id, quantity);
      alert('Product added to cart!');
    } catch (err) {
      alert(err.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <Loading message="Loading product..." />;
  if (error) return <div className="container py-12 text-center text-red-500 text-lg">{error}</div>;
  if (!product) return <div className="container py-12 text-center text-gray-500 text-lg">Product not found</div>;

  return (
    <>
      <div className="py-6 md:py-12 min-h-screen">
        <div className="container px-4">
          <button 
            onClick={() => navigate(-1)}
            className="mb-4 md:mb-6 text-purple-200 hover:text-white font-medium flex items-center gap-2 text-sm md:text-base"
          >
            ← Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
            {/* Images Section */}
            <div>
              <div className="bg-white rounded-xl overflow-hidden shadow-lg mb-3 md:mb-4">
                <img 
                  src={selectedImage} 
                  alt={product.name}
                  className="w-full h-64 md:h-96 object-cover"
                />
              </div>
              {product.images && product.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 md:gap-4">
                  <div 
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 ${selectedImage === product.image ? 'border-primary-500' : 'border-gray-200'}`}
                    onClick={() => setSelectedImage(product.image)}
                  >
                    <img src={product.image} alt={product.name} className="w-full h-16 md:h-20 object-cover" />
                  </div>
                  {product.images.map((img, index) => (
                    <div 
                      key={index}
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 ${selectedImage === img ? 'border-primary-500' : 'border-gray-200'}`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-16 md:h-20 object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-blue-900 mb-3 md:mb-4">{product.name}</h1>
              <p className="text-lg md:text-xl text-blue-700 mb-3 md:mb-4">{product.brand}</p>
              
              <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-base md:text-xl">{'⭐'.repeat(Math.round(product.rating))}</span>
                  <span className="text-blue-700 text-sm md:text-lg">
                    {product.rating} ({product.numReviews} reviews)
                  </span>
                </div>
              </div>

              <div className="text-3xl md:text-5xl font-bold text-yellow-400 mb-4 md:mb-6">
                {formatCurrencyFromUsd(product.price)}
              </div>

              <p className="text-blue-900 text-base md:text-lg leading-relaxed mb-4 md:mb-6">{product.description}</p>

              <div className="bg-slate-100 backdrop-blur-sm rounded-lg p-4 md:p-6 mb-4 md:mb-6 border border-slate-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Category:</span>
                    <span className="ml-2 font-semibold text-blue-900">{product.category}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Brand:</span>
                    <span className="ml-2 font-semibold text-blue-900">{product.brand}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Stock:</span>
                    <span className={`ml-2 font-semibold ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.countInStock > 0 ? `${product.countInStock} available` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              </div>

              {product.countInStock > 0 && (
                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <label className="text-blue-900 font-medium text-base md:text-lg">Quantity:</label>
                  <select 
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="text-gray-900 px-3 md:px-4 py-2 border-2 border-purple-600 rounded-lg focus:border-purple-500 outline-none bg-white text-sm md:text-base"
                  >
                    {[...Array(Math.min(product.countInStock, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={product.countInStock === 0 || addingToCart}
                className="w-full btn btn-primary text-base md:text-lg py-3 md:py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? 'Adding...' : product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;