import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGODB_LOCAL_URI) {
    console.log('📝 No MongoDB URI provided, skipping database connection');
    return false;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_LOCAL_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    mongoose.connection.on('connected', () => {
      console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });
    
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Failed: ${error.message}`);
    return false;
  }
};

export const getConnectionStatus = () => mongoose.connection.readyState === 1;
export default connectDB;