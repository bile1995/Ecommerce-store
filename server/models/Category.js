import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  image: String
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: String,
  image: String,
  subcategories: [subcategorySchema],
  featured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;
