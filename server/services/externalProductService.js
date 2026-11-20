import axios from 'axios';

const API_BASE_URL = process.env.EXTERNAL_PRODUCTS_API_URL || 'https://dummyjson.com/products';

/**
 * Transform DummyJSON product to match our schema
 */
const transformProduct = (product) => {
  return {
    _id: product.id.toString(),
    name: product.title,
    description: product.description,
    price: product.price,
    image: product.thumbnail || product.images?.[0] || '',
    images: product.images || [],
    category: product.category, // Keep original category slug
    brand: product.brand || 'Generic',
    countInStock: product.stock || 0,
    rating: product.rating || 0,
    numReviews: product.reviews?.length || 0,
    reviews: product.reviews?.map(review => ({
      name: review.reviewerName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.date
    })) || [],
    featured: product.rating >= 4.5, // Mark high-rated products as featured
    tags: product.tags || [],
    discount: product.discountPercentage || 0
  };
};

/**
 * Get all products with pagination and filtering
 */
export const getExternalProducts = async ({ keyword, category, brand, page = 1, limit = 12 }) => {
  try {
    let url = API_BASE_URL;
    const skip = (page - 1) * limit;

    // Search by keyword
    if (keyword) {
      url = `${API_BASE_URL}/search?q=${encodeURIComponent(keyword)}&limit=${limit}&skip=${skip}`;
    } 
    // Filter by category
    else if (category) {
      // Use category as-is since external API expects slug format
      url = `${API_BASE_URL}/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`;
    } 
    // Get all products with pagination
    else {
      url = `${API_BASE_URL}?limit=${limit}&skip=${skip}`;
    }

    console.log('🔍 External API URL:', url);
    const response = await axios.get(url);
    const data = response.data;

    let products = data.products.map(transformProduct);

    // Filter by brand if specified (DummyJSON doesn't support brand filtering directly)
    if (brand) {
      products = products.filter(p => 
        p.brand.toLowerCase() === brand.toLowerCase()
      );
    }

    return {
      products,
      page,
      pages: Math.ceil(data.total / limit),
      total: data.total
    };
  } catch (error) {
    console.error('Error fetching external products:', error.message);
    throw new Error('Failed to fetch products from external API');
  }
};

/**
 * Get a single product by ID
 */
export const getExternalProductById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return transformProduct(response.data);
  } catch (error) {
    console.error('Error fetching external product:', error.message);
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch product from external API');
  }
};

/**
 * Get featured products (high-rated products)
 */
export const getExternalFeaturedProducts = async (limit = 8) => {
  try {
    // Get products sorted by rating
    const response = await axios.get(`${API_BASE_URL}?limit=30&sortBy=rating&order=desc`);
    const products = response.data.products
      .map(transformProduct)
      .filter(p => p.rating >= 4.5)
      .slice(0, limit);

    return products;
  } catch (error) {
    console.error('Error fetching featured products:', error.message);
    throw new Error('Failed to fetch featured products from external API');
  }
};

/**
 * Get all product categories
 */
export const getExternalCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/category-list`);
    
    // Filter out categories that don't exist in the API
    const validCategories = ['beauty', 'fragrances', 'furniture', 'groceries', 'home-decoration', 'kitchen-accessories', 'laptops', 'mens-shirts', 'mens-shoes', 'mens-watches', 'mobile-accessories', 'motorcycle', 'skin-care', 'smartphones', 'sports-accessories', 'sunglasses', 'tablets', 'tops', 'vehicle', 'womens-bags', 'womens-dresses', 'womens-jewellery', 'womens-shoes', 'womens-watches'];
    
    // Transform category list to match our category structure
    const categories = response.data
      .filter(categorySlug => validCategories.includes(categorySlug))
      .map(categorySlug => ({
        _id: categorySlug,
        name: categorySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        slug: categorySlug,
        subcategories: [],
        featured: false
      }));
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    throw new Error('Failed to fetch categories from external API');
  }
};

/**
 * Get all brands (extract from products)
 */
export const getExternalBrands = async () => {
  try {
    // Get a large sample of products to extract brands
    const response = await axios.get(`${API_BASE_URL}?limit=100`);
    const brands = [...new Set(
      response.data.products
        .map(p => p.brand)
        .filter(Boolean)
    )];
    return brands;
  } catch (error) {
    console.error('Error fetching brands:', error.message);
    throw new Error('Failed to fetch brands from external API');
  }
};

