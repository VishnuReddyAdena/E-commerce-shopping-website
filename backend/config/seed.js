import { supabase } from './supabase.js';
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
    console.log('Seeding Supabase Database...');

    // 1. Seed Categories (Clear & re-insert)
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const categoriesToInsert = sampleCategories.map(cat => ({
      name: cat.name,
      slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      image: cat.image
    }));
    const { error: catErr } = await supabase.from('categories').insert(categoriesToInsert);
    if (catErr) throw catErr;
    console.log('Categories seeded successfully!');

    // 2. Seed Brands (Clear & re-insert)
    await supabase.from('brands').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const brandsToInsert = sampleBrands.map(br => ({
      name: br.name,
      slug: br.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      logo: br.logo
    }));
    const { error: brandErr } = await supabase.from('brands').insert(brandsToInsert);
    if (brandErr) throw brandErr;
    console.log('Brands seeded successfully!');

    // 3. Seed Coupons (Clear & re-insert)
    await supabase.from('coupons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const couponsToInsert = sampleCoupons.map(cp => ({
      code: cp.code,
      type: cp.discountType,
      value: cp.discountValue,
      expiry_date: cp.expiryDate
    }));
    const { error: couponErr } = await supabase.from('coupons').insert(couponsToInsert);
    if (couponErr) throw couponErr;
    console.log('Coupons seeded successfully!');

    // 4. Seed Products (Clear & re-insert in chunks)
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const productsToInsert = sampleProducts.map(p => ({
      title: p.title,
      description: p.description,
      price: p.price,
      category: p.category,
      sub_category: p.subCategory,
      images: p.images || [],
      videos: p.videos || [],
      inventory_count: p.inventoryCount || 0,
      rating_average: p.ratings?.average || 4.5,
      rating_count: p.ratings?.count || 10,
      reviews: p.reviews || [],
      brand: p.brand || 'Generic',
      colors: p.colors || [],
      sizes: p.sizes || [],
      specifications: p.specifications || {},
      variants: p.variants || [],
      is_flash_sale: p.isFlashSale || false,
      flash_sale_price: p.flashSalePrice || null
    }));

    const chunkSize = 50;
    for (let i = 0; i < productsToInsert.length; i += chunkSize) {
      const chunk = productsToInsert.slice(i, i + chunkSize);
      const { error: prodErr } = await supabase.from('products').insert(chunk);
      if (prodErr) throw prodErr;
    }

    console.log(`Products seeded successfully with ${productsToInsert.length} items!`);
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};
