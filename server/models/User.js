import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false, 
    select: false 
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  picture: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  shippingAddress: {
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  phone: {
    type: String,
    default: ''
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;

