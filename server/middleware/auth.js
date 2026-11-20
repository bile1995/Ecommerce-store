import jwt from 'jsonwebtoken';

// JWT authentication middleware
export const checkJwt = (req, res, next) => {
  try {
    console.log('🔐 checkJwt middleware called');
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No auth header or invalid format');
      return res.status(401).json({ message: 'Authentication required. Please login.' });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 Token found, verifying...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    req.userId = decoded.userId || decoded.sub;
    req.auth = { sub: req.userId, payload: decoded };

    console.log('✅ Token verified, userId:', req.userId);
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }

    return res.status(401).json({ message: 'Invalid token. Please login again.' });
  }
};

console.log('✅ JWT authentication enabled');

// Middleware to check if user is admin
export const checkAdmin = async (req, res, next) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('❌ Admin check error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Optional: Middleware to check if user has specific permissions
export const checkPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    const permissions = req.auth?.permissions || [];

    const hasPermission = requiredPermissions.every(permission =>
      permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have the required permissions'
      });
    }

    next();
  };
};

