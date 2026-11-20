import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, selectedSubcategory, currentPage]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      console.log('Fetched categories:', data);
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        ...(searchTerm && { keyword: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedSubcategory && { subcategory: selectedSubcategory }),
      };
      console.log('Fetching products with params:', params);
      const data = await productService.getProducts(params);
      setProducts(data.products);
      setTotalPages(data.pages);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(''); // Reset subcategory when category changes
    setShowSubcategories(true); // Show subcategories when a category is selected
    setCurrentPage(1);
  };

  const getSelectedCategoryData = () => {
    return categories.find(cat => cat.name === selectedCategory || cat.slug === selectedCategory);
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="py-12 min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4">
        <h1 className="text-center text-4xl font-bold mb-8 text-white">Our Products</h1>

        {/* Filters Section */}
        <div className="mb-12">
          <form onSubmit={handleSearch} className="flex gap-4 mb-8 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-6 py-3 border-2 border-cyan-400 bg-slate-800/70 text-white placeholder-cyan-300 rounded-full text-base outline-none focus:border-cyan-300 transition-colors"
            />
            <button type="submit" className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all">
              Search
            </button>
          </form>

          {/* Categories */}
          <div className="flex gap-4 flex-wrap justify-center mb-6">
            <div
              className={`px-6 py-2 border-2 rounded-full font-medium transition-all cursor-pointer select-none ${
                !selectedCategory
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400 shadow-lg'
                  : 'bg-slate-700/50 text-emerald-300 border-emerald-500 hover:bg-slate-600/50'
              }`}
              onClick={() => {
                setSelectedCategory('');
                setSelectedSubcategory('');
                setShowSubcategories(false);
                setCurrentPage(1);
              }}
            >
              All Categories
            </div>
            {categories.map((category) => (
              <button
                key={category._id}
                className={`px-6 py-2 border-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.name || selectedCategory === category.slug
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400 shadow-lg'
                    : 'bg-slate-700/50 text-emerald-300 border-emerald-500 hover:bg-slate-600/50'
                }`}
                onClick={() => handleCategoryChange(category.slug || category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Subcategories */}
          {selectedCategory && showSubcategories && getSelectedCategoryData()?.subcategories?.length > 0 && (
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                className={`px-4 py-1.5 border rounded-full text-sm font-medium transition-all ${
                  !selectedSubcategory
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400 shadow-md'
                    : 'bg-slate-600/50 text-orange-300 border-orange-500 hover:bg-slate-500/50'
                }`}
                onClick={() => handleSubcategoryChange('')}
              >
                All Subcategories
              </button>
              {getSelectedCategoryData().subcategories.map((subcategory) => (
                <button
                  key={subcategory._id || subcategory.name}
                  className={`px-4 py-1.5 border rounded-full text-sm font-medium transition-all ${
                    selectedSubcategory === subcategory.name || selectedSubcategory === subcategory.slug
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400 shadow-md'
                      : 'bg-slate-600/50 text-orange-300 border-orange-500 hover:bg-slate-500/50'
                  }`}
                  onClick={() => handleSubcategoryChange(subcategory.slug || subcategory.name)}
                >
                  {subcategory.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <Loading message="Loading products..." />
        ) : error ? (
          <div className="text-center text-red-400 py-8 text-lg">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-xl text-slate-300">
            <p>No products found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 flex-wrap">
                <button
                  className="px-6 py-2 bg-slate-700/50 text-white border-2 border-slate-500 rounded-lg font-medium hover:bg-slate-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-all min-w-[40px] ${
                        currentPage === index + 1
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400'
                          : 'bg-slate-700/50 text-white border-slate-500 hover:bg-slate-600/50'
                      }`}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  className="px-6 py-2 bg-slate-700/50 text-white border-2 border-slate-500 rounded-lg font-medium hover:bg-slate-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;

