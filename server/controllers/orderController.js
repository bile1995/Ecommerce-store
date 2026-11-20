import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import mongoose from 'mongoose';
import { getExternalProductById } from '../services/externalProductService.js';

// Check if external API should be used
const useExternalAPI = () => process.env.USE_EXTERNAL_API === 'true';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
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

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Verify stock availability - skip validation, use denormalized data
    for (const item of orderItems) {
      console.log('🔍 Checking product:', item.product);
      let product;
      
      // Try to find product for stock validation
      try {
        if (mongoose.Types.ObjectId.isValid(item.product)) {
          console.log('📦 Checking MongoDB for product');
          product = await Product.findById(item.product);
          if (!product && useExternalAPI()) {
            console.log('📡 Not in MongoDB, trying external API');
            product = await getExternalProductById(item.product);
          }
        } else if (useExternalAPI()) {
          console.log('📡 Checking external API for product');
          product = await getExternalProductById(item.product);
        }
      } catch (err) {
        console.log('⚠️ Error fetching product, using denormalized data:', err.message);
      }
      
      // Only validate stock if product was found
      if (product && product.countInStock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for ${item.name || product.name}` 
        });
      }
      
      console.log('✅ Product validation passed or skipped for:', item.name);
    }

    const order = new Order({
      user: user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: req.body.isPaid ? 'processing' : 'pending',
      isPaid: req.body.isPaid || false,
      paidAt: req.body.isPaid ? Date.now() : undefined,
      paymentResult: req.body.paymentMethodId ? {
        id: req.body.paymentMethodId,
        status: 'completed',
        update_time: new Date().toISOString()
      } : undefined
    });

    const createdOrder = await order.save();

    // Update product stock (only for MongoDB products)
    if (!useExternalAPI()) {
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        product.countInStock -= item.quantity;
        await product.save();
      }
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: user._id },
      { items: [], totalPrice: 0 }
    );

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required. Please login.'
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image');

    if (order) {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user owns this order or is admin
      if (order.user._id.toString() === user._id.toString() || user.role === 'admin') {
        res.json(order);
      } else {
        res.status(403).json({ message: 'Not authorized to view this order' });
      }
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
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

    const orders = await Order.find({ user: user._id })
      .populate('orderItems.product', 'name image')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'processing';
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = req.body.status;

      if (req.body.status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

