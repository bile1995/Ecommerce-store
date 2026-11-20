import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { getExternalProductById } from '../services/externalProductService.js';

// Check if external API should be used
const useExternalAPI = () => process.env.USE_EXTERNAL_API === 'true';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required. Please login.'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      cart = await Cart.create({ user: user._id, items: [] });
      return res.json(cart);
    }

    // Only populate if using MongoDB products AND items have ObjectId format
    if (!useExternalAPI() && cart && cart.items.length > 0) {
      try {
        await cart.populate('items.product');
      } catch (populateError) {
        // If populate fails, cart items are from external API, return as is
        console.log('⚠️ Populate failed, returning cart without population');
      }
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  try {
    console.log('🛒 addToCart controller called');
    const { productId, quantity } = req.body;
    const userId = req.userId;

    console.log('📦 Product ID:', productId, 'Quantity:', quantity, 'User ID:', userId);

    if (!userId) {
      console.log('❌ No userId found');
      return res.status(401).json({
        message: 'Authentication required. Please login.'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User found:', user.email);

    // Fetch product - check if it's MongoDB ObjectId or external API ID
    let product;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      console.log(`📦 Fetching product ${productId} from MongoDB`);
      product = await Product.findById(productId);
      if (!product && useExternalAPI()) {
        console.log(`📡 Not in MongoDB, trying external API`);
        product = await getExternalProductById(productId);
      }
    } else if (useExternalAPI()) {
      console.log(`📡 Fetching product ${productId} from external API`);
      product = await getExternalProductById(productId);
    }

    if (!product) {
      console.log('❌ Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('✅ Product found:', product.name);

    if (product.countInStock < quantity) {
      console.log('❌ Not enough stock');
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    let cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      console.log('📝 Creating new cart');
      cart = new Cart({ user: user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      console.log('📝 Updating existing cart item');
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      console.log('📝 Adding new item to cart');
      cart.items.push({
        product: productId,
        name: product.name,
        image: product.image,
        quantity,
        price: product.price
      });
    }

    await cart.save();
    console.log('✅ Cart saved');

    // Only populate if using MongoDB products AND items have ObjectId format
    if (!useExternalAPI() && cart.items.length > 0) {
      try {
        await cart.populate('items.product');
      } catch (populateError) {
        console.log('⚠️ Populate failed, returning cart without population');
      }
    }

    console.log('✅ Sending cart response');
    res.json(cart);
  } catch (error) {
    console.error('❌ Error in addToCart:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required. Please login.'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check stock availability
    if (useExternalAPI() || !mongoose.Types.ObjectId.isValid(item.product)) {
      const product = await getExternalProductById(item.product);
      if (product && product.countInStock < quantity) {
        return res.status(400).json({ message: 'Not enough stock available' });
      }
    } else {
      const product = await Product.findById(item.product);
      if (product && product.countInStock < quantity) {
        return res.status(400).json({ message: 'Not enough stock available' });
      }
    }

    item.quantity = quantity;
    await cart.save();
    
    // Only populate if using MongoDB products AND items have ObjectId format
    if (!useExternalAPI() && cart.items.length > 0) {
      try {
        await cart.populate('items.product');
      } catch (populateError) {
        console.log('⚠️ Populate failed, returning cart without population');
      }
    }

    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required. Please login.'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);

    await cart.save();
    
    // Only populate if using MongoDB products AND items have ObjectId format
    if (!useExternalAPI() && cart.items.length > 0) {
      try {
        await cart.populate('items.product');
      } catch (populateError) {
        console.log('⚠️ Populate failed, returning cart without population');
      }
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required. Please login.'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cart = await Cart.findOne({ user: user._id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

