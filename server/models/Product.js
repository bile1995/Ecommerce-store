import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true,
    default: ''
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  countInStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [reviewSchema],
  featured: {
    type: Boolean,
    default: false
  },
  // External API fields
  externalId: {
    type: String,
    sparse: true // Allow null values but create index for non-null
  },
  source: {
    type: String,
    enum: ['local', 'external_api'],
    default: 'local'
  },
  lastSynced: {
    type: Date
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;

