import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Coupon from '../models/Coupon.js';
import Product from '../models/Product.js';
import { memoryCategories, memoryBrands, memoryCoupons, memoryProducts } from './memoryStore.js';

const sampleCategories = memoryCategories;
const sampleBrands = memoryBrands;
const sampleCoupons = memoryCoupons;
const sampleProducts = memoryProducts;

export const seedDB = async () => {
  if (!global.isDbConnected) {
    console.log('[Failover] Skipping database seeding in Sandbox Mode.');
    return;
  }
  try {
    // 1. Seed Categories - Delete and re-seed to update all 29 categories
    await Category.deleteMany({});
    await Category.insertMany(sampleCategories);
    console.log('Categories collection initialized with 29 MERN categories!');

    // 2. Seed Brands
    const brandCount = await Brand.countDocuments({});
    if (brandCount === 0) {
      await Brand.insertMany(sampleBrands);
      console.log('Brands collection initialized!');
    }

    // 3. Seed Coupons
    const couponCount = await Coupon.countDocuments({});
    if (couponCount === 0) {
      await Coupon.insertMany(sampleCoupons);
      console.log('Coupons collection initialized!');
    }

    // 4. Seed Products - Delete and re-seed to populate mock products under each category
    await Product.deleteMany({});
    
    // Chunk database insertion to handle large data sets smoothly
    const chunkSize = 100;
    for (let i = 0; i < sampleProducts.length; i += chunkSize) {
      const chunk = sampleProducts.slice(i, i + chunkSize);
      await Product.insertMany(chunk);
    }
    
    console.log(`Products database collection seeded successfully with ${sampleProducts.length} items!`);
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};
