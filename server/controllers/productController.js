import Product from '../models/Product.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';
import {
  getExternalProducts,
  getExternalProductById,
  getExternalFeaturedProducts,
  getExternalCategories
} from '../services/externalProductService.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;
const useExternalAPI = () => process.env.USE_EXTERNAL_API === 'true';

export const getProducts = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const pageSize = 12;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: 'i' } } : {};

    let categoryFilter = {};
    if (req.query.category) {
      const categorySlug = req.query.category.toLowerCase().replace(/\s+/g, '-');
      categoryFilter = {
        $or: [
          { category: req.query.category },
          { category: categorySlug },
          { category: { $regex: req.query.category, $options: 'i' } }
        ]
      };
    }
    
    const brand = req.query.brand ? { brand: req.query.brand } : {};

    if (useExternalAPI()) {
      const externalResult = await getExternalProducts({
        keyword: req.query.keyword,
        category: req.query.category,
        brand: req.query.brand,
        page,
        limit: pageSize
      });
      
      const mongoProducts = await Product.find({ ...keyword, ...categoryFilter, ...brand })
        .sort({ createdAt: -1 });
      
      const allProducts = [...mongoProducts, ...externalResult.products];
      
      return res.json({
        products: allProducts,
        page: externalResult.page,
        pages: Math.ceil(allProducts.length / pageSize),
        total: allProducts.length
      });
    }

    const count = await Product.countDocuments({ ...keyword, ...categoryFilter, ...brand });
    const products = await Product.find({ ...keyword, ...categoryFilter, ...brand })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      const product = await Product.findById(req.params.id).populate('reviews.user', 'name picture');
      if (product) {
        return res.json(product);
      }
    }
    
    if (useExternalAPI()) {
      const product = await getExternalProductById(req.params.id);
      if (product) {
        return res.json(product);
      }
    }

    res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    // Validate required fields
    const { name, description, price, image, category, brand, countInStock } = req.body;
    
    if (!name || !description || !price || !image || !category || !brand) {
      return res.status(400).json({ message: 'Please provide all required fields: name, description, price, image, category, brand' });
    }

    if (price < 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    if (countInStock < 0) {
      return res.status(400).json({ message: 'Count in stock must be a positive number' });
    }

    const categoryName = category.trim();
    if (categoryName) {
      const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
      const existingCategory = await Category.findOne({ 
        $or: [{ name: categoryName }, { slug: categorySlug }] 
      });
      
      if (!existingCategory) {
        await Category.create({
          name: categoryName,
          slug: categorySlug,
          description: `${categoryName} products`,
          subcategories: [],
          featured: false
        });
      }
    }

    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      image: image.trim(),
      images: req.body.images || [],
      category: categoryName,
      brand: brand.trim(),
      countInStock: Number(countInStock) || 0,
      featured: req.body.featured || false,
      rating: 0,
      numReviews: 0,
      reviews: []
    });

    const createdProduct = await product.save();
    console.log('✅ Product created successfully:', createdProduct.name);
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('❌ Product creation error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.price = req.body.price || product.price;
      product.image = req.body.image || product.image;
      product.images = req.body.images || product.images;
      product.category = req.body.category || product.category;
      product.brand = req.body.brand || product.brand;
      product.countInStock = req.body.countInStock ?? product.countInStock;
      product.featured = req.body.featured ?? product.featured;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    if (useExternalAPI()) {
      const products = await getExternalFeaturedProducts(8);
      return res.json(products);
    }

    const products = await Product.find({ featured: true }).limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    if (useExternalAPI()) {
      const externalCategories = await getExternalCategories();
      const localCategories = await Category.find().sort({ name: 1 });
      const allCategories = [...localCategories, ...externalCategories.filter(extCat => 
        !localCategories.some(localCat => localCat.slug === extCat.slug)
      )];
      return res.json(allCategories);
    }

    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProductReview = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get user info
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.userId.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    const review = {
      name: user.name,
      rating: Number(rating),
      comment,
      user: req.userId,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const syncProducts = async (req, res) => {
  try {
    res.json({ message: 'Sync started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const syncSingleProductById = async (req, res) => {
  try {
    res.json({ message: 'Single product sync started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductSyncStats = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const totalProducts = await Product.countDocuments();
    res.json({ totalProducts, lastSync: null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
