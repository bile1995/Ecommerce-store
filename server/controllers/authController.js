import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { sub: userId, userId: userId },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '7d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('📝 Signup attempt for email:', email);

    // Validation
    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists:', email.toLowerCase());
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    console.log('🔐 Hashing password...');
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('👤 Creating user...');
    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });

    const savedUser = await user.save();

    // Generate token
    const token = generateToken(savedUser._id);

    console.log('✅ User created successfully:', email, 'Role:', savedUser.role);
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        picture: savedUser.picture,
        role: savedUser.role
      }
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for email:', email);

    // Validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    console.log('👤 User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('❌ User not found with email:', email.toLowerCase());
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user has password (not Auth0 user)
    if (!user.password) {
      console.log('❌ User has no password (Auth0 user)');
      return res.status(401).json({
        message: 'This account uses social login. Please login with Auth0.'
      });
    }

    console.log('🔑 Checking password...');
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('✅ Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log('✅ Login successful for:', email, 'Role:', user.role);
    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Public
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ valid: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ valid: false, message: 'User not found' });
    }

    res.json({ valid: true, userId: user._id });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
};

