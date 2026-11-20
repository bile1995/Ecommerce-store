import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { categoryService } from '../../services/categoryService';
import Loading from '../../components/Loading';
import { formatCurrencyFromUsd, convertUsdToEtb } from '../../utils/currency';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    brand: '',
    countInStock: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllProducts({ limit: 100 });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: Number(formData.price) / 80,
        countInStock: Number(formData.countInStock)
      };
      
      if (editingProduct) {
        await adminService.updateProduct(editingProduct._id, productData);
        alert('Product updated successfully!');
      } else {
        await adminService.createProduct(productData);
        alert('Product created successfully!');
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        image: '',
        category: '',
        brand: '',
        countInStock: '',
      });
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: convertUsdToEtb(product.price),
      image: product.image,
      category: product.category,
      brand: product.brand,
      countInStock: product.countInStock,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminService.deleteProduct(id);
        alert('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: '',
      brand: '',
      countInStock: '',
    });
    setShowModal(true);
  };

  if (loading) return <Loading message="Loading products..." />;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">📦 Manage Products</h1>
        <button onClick={handleAddNew} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all">
          + Add New Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Image</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Name</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Price</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Category</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Stock</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 px-6 text-center text-gray-500">
                    No products found. Click "Add New Product" to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded border border-gray-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900">{product.name}</td>
                    <td className="py-4 px-6 text-gray-900">{formatCurrencyFromUsd(product.price)}</td>
                    <td className="py-4 px-6 text-gray-900">{product.category}</td>
                    <td className="py-4 px-6 text-gray-900">{product.countInStock}</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-700 mr-4 font-medium"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-blue-200 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (Birr)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      step="0.01"
                      required
                    />
                    {formData.price && (
                      <p className="text-sm text-blue-600 mt-1">
                        USD equivalent: ${(Number(formData.price) / 80).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                    <input
                      type="number"
                      name="countInStock"
                      value={formData.countInStock}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-blue-200" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="beauty">Beauty</option>
                      <option value="fragrances">Fragrances</option>
                      <option value="furniture">Furniture</option>
                      <option value="groceries">Groceries</option>
                      <option value="home-decoration">Home Decoration</option>
                      <option value="kitchen-accessories">Kitchen Accessories</option>
                      <option value="laptops">Laptops</option>
                      <option value="mens-shirts">Mens Shirts</option>
                      <option value="mens-shoes">Mens Shoes</option>
                      <option value="mens-watches">Mens Watches</option>
                      <option value="mobile-accessories">Mobile Accessories</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="skin-care">Skin Care</option>
                      <option value="smartphones">Smartphones</option>
                      <option value="sports-accessories">Sports Accessories</option>
                      <option value="sunglasses">Sunglasses</option>
                      <option value="tablets">Tablets</option>
                      <option value="tops">Tops</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="womens-bags">Womens Bags</option>
                      <option value="womens-dresses">Womens Dresses</option>
                      <option value="womens-jewellery">Womens Jewellery</option>
                      <option value="womens-shoes">Womens Shoes</option>
                      <option value="womens-watches">Womens Watches</option>
                      {categories.filter(cat => !['beauty', 'fragrances', 'furniture', 'groceries', 'home-decoration', 'kitchen-accessories', 'laptops', 'mens-shirts', 'mens-shoes', 'mens-watches', 'mobile-accessories', 'motorcycle', 'skin-care', 'smartphones', 'sports-accessories', 'sunglasses', 'tablets', 'tops', 'vehicle', 'womens-bags', 'womens-dresses', 'womens-jewellery', 'womens-shoes', 'womens-watches'].includes(cat.slug)).map((cat) => (
                        <option key={cat._id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all">
                  {editingProduct ? '✅ Update' : '✅ Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 border border-gray-300 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
