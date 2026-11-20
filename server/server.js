import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB, { getConnectionStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

connectDB().then((connected) => {
  if (!connected) {
    console.warn('⚠️  Running without database connection');
    console.log('📝 Install MongoDB or set up MongoDB Atlas to enable full functionality');
  }
}).catch((error) => {
  console.warn('⚠️  Database initialization failed:', error.message);
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Database connection middleware for all API routes
app.use('/api', (req, res, next) => {
  if (!getConnectionStatus() && req.path !== '/health') {
    return res.status(503).json({ 
      message: 'Database connection unavailable',
      error: 'SERVICE_UNAVAILABLE'
    });
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Ecommerce API is running',
    database: getConnectionStatus() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to MERN Ecommerce API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      users: '/api/users',
      cart: '/api/cart',
      orders: '/api/orders',
      health: '/api/health'
    }
  });
});

app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});

export default app;