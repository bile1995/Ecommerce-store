import Product from '../models/Product.js';
import { getExternalProducts, getExternalProductById } from './externalProductService.js';

/**
 * Sync external API products to local database
 */
export const syncExternalProducts = async (options = {}) => {
  const { limit = 100, overwrite = false } = options;
  
  try {
    console.log('🔄 Starting product sync from external API...');
    
    // Fetch products from external API
    const result = await getExternalProducts({ limit });
    const externalProducts = result.products;
    
    let syncStats = {
      total: externalProducts.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };
    
    for (const externalProduct of externalProducts) {
      try {
        // Check if product already exists
        const existingProduct = await Product.findOne({ 
          $or: [
            { _id: externalProduct._id },
            { name: externalProduct.name, brand: externalProduct.brand }
          ]
        });
        
        if (existingProduct && !overwrite) {
          syncStats.skipped++;
          continue;
        }
        
        // Prepare product data for MongoDB
        const productData = {
          name: externalProduct.name,
          description: externalProduct.description,
          price: externalProduct.price,
          image: externalProduct.image,
          images: externalProduct.images || [],
          category: externalProduct.category,
          brand: externalProduct.brand,
          countInStock: externalProduct.countInStock,
          rating: externalProduct.rating,
          numReviews: externalProduct.numReviews,
          featured: externalProduct.featured,
          // Add external API metadata
          externalId: externalProduct._id,
          source: 'external_api',
          lastSynced: new Date()
        };
        
        if (existingProduct) {
          // Update existing product
          Object.assign(existingProduct, productData);
          await existingProduct.save();
          syncStats.updated++;
        } else {
          // Create new product
          const newProduct = new Product(productData);
          await newProduct.save();
          syncStats.created++;
        }
        
      } catch (error) {
        console.error(`Error syncing product ${externalProduct.name}:`, error.message);
        syncStats.errors++;
      }
    }
    
    console.log('✅ Product sync completed:', syncStats);
    return syncStats;
    
  } catch (error) {
    console.error('❌ Product sync failed:', error.message);
    throw error;
  }
};

/**
 * Sync a single product by ID
 */
export const syncSingleProduct = async (externalId, overwrite = false) => {
  try {
    const externalProduct = await getExternalProductById(externalId);
    if (!externalProduct) {
      throw new Error('Product not found in external API');
    }
    
    const existingProduct = await Product.findOne({ 
      $or: [
        { externalId: externalId },
        { name: externalProduct.name, brand: externalProduct.brand }
      ]
    });
    
    const productData = {
      name: externalProduct.name,
      description: externalProduct.description,
      price: externalProduct.price,
      image: externalProduct.image,
      images: externalProduct.images || [],
      category: externalProduct.category,
      brand: externalProduct.brand,
      countInStock: externalProduct.countInStock,
      rating: externalProduct.rating,
      numReviews: externalProduct.numReviews,
      featured: externalProduct.featured,
      externalId: externalId,
      source: 'external_api',
      lastSynced: new Date()
    };
    
    if (existingProduct && !overwrite) {
      return { action: 'skipped', product: existingProduct };
    }
    
    if (existingProduct) {
      Object.assign(existingProduct, productData);
      const updated = await existingProduct.save();
      return { action: 'updated', product: updated };
    } else {
      const newProduct = new Product(productData);
      const created = await newProduct.save();
      return { action: 'created', product: created };
    }
    
  } catch (error) {
    console.error(`Error syncing single product ${externalId}:`, error.message);
    throw error;
  }
};

/**
 * Get sync statistics
 */
export const getSyncStats = async () => {
  try {
    const totalProducts = await Product.countDocuments();
    const externalProducts = await Product.countDocuments({ source: 'external_api' });
    const localProducts = totalProducts - externalProducts;
    const lastSynced = await Product.findOne({ source: 'external_api' })
      .sort({ lastSynced: -1 })
      .select('lastSynced');
    
    return {
      totalProducts,
      externalProducts,
      localProducts,
      lastSyncDate: lastSynced?.lastSynced || null
    };
  } catch (error) {
    console.error('Error getting sync stats:', error.message);
    throw error;
  }
};