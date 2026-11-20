import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [{
    product: {
      type: mongoose.Schema.Types.Mixed, // Support both ObjectId and String
      required: true
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['mobile_banking', 'cash']
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryOption: {
    type: String,
    enum: ['standard', 'express', 'same_day'],
    default: 'standard'
  },
  trackingNumber: {
    type: String,
    default: ''
  },
  estimatedDelivery: {
    type: Date
  },
  trackingHistory: [{
    status: String,
    location: String,
    timestamp: { type: Date, default: Date.now },
    description: String
  }]
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;

