import { supabase } from '../config/supabase.js';
import { memoryProducts } from '../config/memoryStore.js';
import { realtimeService } from '../services/supabase.service.js';

// Map Postgres row to frontend structure
const mapProductToFrontend = (prod) => {
  if (!prod) return null;
  return {
    _id: prod.id,
    id: prod.id,
    title: prod.title,
    description: prod.description,
    price: Number(prod.price) || 0,
    category: prod.category,
    subCategory: prod.sub_category,
    images: prod.images || [],
    videos: prod.videos || [],
    inventoryCount: prod.inventory_count || 0,
    ratings: {
      average: Number(prod.rating_average) || 0,
      count: prod.rating_count || 0
    },
    reviews: prod.reviews || [],
    brand: prod.brand || 'Generic',
    colors: prod.colors || [],
    sizes: prod.sizes || [],
    specifications: prod.specifications || {},
    variants: prod.variants || [],
    isFlashSale: prod.is_flash_sale || false,
    flashSalePrice: prod.flash_sale_price ? Number(prod.flash_sale_price) : undefined,
    createdAt: prod.created_at,
    updatedAt: prod.updated_at
  };
};

const checkAndEmitInventory = async (req, product) => {
  const io = req.app.get('socketio');
  const mapped = mapProductToFrontend(product);
  
  if (io) {
    io.emit('inventoryUpdate', {
      productId: mapped.id,
      title: mapped.title,
      inventoryCount: mapped.inventoryCount
    });
  }

  try {
    await realtimeService.broadcastEvent('e-commerce-realtime', 'inventoryUpdate', {
      productId: mapped.id,
      title: mapped.title,
      inventoryCount: mapped.inventoryCount
    });

    if (mapped.inventoryCount <= 5) {
      await realtimeService.broadcastEvent('e-commerce-notifications', 'lowStock', {
        productId: mapped.id,
        title: mapped.title,
        inventoryCount: mapped.inventoryCount
      });
    }
  } catch (err) {
    console.error('Supabase Realtime broadcast failed:', err.message);
  }
};

// @desc    Get all products with filters, sorting, and search
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  const { keyword, category, brand, minPrice, maxPrice, rating, inStock, sortBy, colors, sizes, isFlashSale } = req.query;

  // DB Failover
  if (!global.isDbConnected) {
    let list = [...memoryProducts];

    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(kw) || 
        p.description.toLowerCase().includes(kw) ||
        p.category.toLowerCase().includes(kw) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(kw))
      );
    }
    if (category) {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (brand) {
      list = list.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    }
    if (minPrice) {
      list = list.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      list = list.filter(p => p.price <= Number(maxPrice));
    }
    if (rating) {
      list = list.filter(p => (p.ratings?.average || 0) >= Number(rating));
    }
    if (inStock === 'true') {
      list = list.filter(p => p.inventoryCount > 0);
    }
    if (isFlashSale === 'true') {
      list = list.filter(p => p.isFlashSale === true);
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
    } else if (sortBy === 'popular') {
      list.sort((a, b) => (b.ratings?.count || 0) - (a.ratings?.count || 0));
    } else {
      list.reverse();
    }

    return res.json(list);
  }

  try {
    let q = supabase.from('products').select('*');

    if (keyword) {
      q = q.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,category.ilike.%${keyword}%,brand.ilike.%${keyword}%,sub_category.ilike.%${keyword}%`);
    }
    if (category) {
      q = q.eq('category', category);
    }
    if (brand) {
      q = q.eq('brand', brand);
    }
    if (minPrice) {
      q = q.gte('price', Number(minPrice));
    }
    if (maxPrice) {
      q = q.lte('price', Number(maxPrice));
    }
    if (rating) {
      q = q.gte('rating_average', Number(rating));
    }
    if (inStock === 'true') {
      q = q.gt('inventory_count', 0);
    }
    if (isFlashSale === 'true') {
      q = q.eq('is_flash_sale', true);
    }
    if (colors) {
      q = q.overlaps('colors', colors.split(','));
    }
    if (sizes) {
      q = q.overlaps('sizes', sizes.split(','));
    }

    if (sortBy === 'price-asc') {
      q = q.order('price', { ascending: true });
    } else if (sortBy === 'price-desc') {
      q = q.order('price', { ascending: false });
    } else if (sortBy === 'rating') {
      q = q.order('rating_average', { ascending: false });
    } else if (sortBy === 'popular') {
      q = q.order('rating_count', { ascending: false });
    } else {
      q = q.order('created_at', { ascending: false });
    }

    const { data: products, error } = await q;
    if (error) throw error;

    res.json(products.map(mapProductToFrontend));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  if (!global.isDbConnected) {
    const prod = memoryProducts.find(p => p._id === req.params.id);
    if (prod) return res.json(prod);
    return res.status(404).json({ message: 'Product not found (sandbox)' });
  }

  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;

    if (product) {
      res.json(mapProductToFrontend(product));
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recommendations
// @route   GET /api/products/:id/recommendations
// @access  Public
export const getProductRecommendations = async (req, res) => {
  if (!global.isDbConnected) {
    const product = memoryProducts.find(p => p._id === req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const list = memoryProducts.filter(p => p.category === product.category && p._id !== product._id);
    return res.json(list.slice(0, 4));
  }

  try {
    const { data: product, error: firstErr } = await supabase
      .from('products')
      .select('id, category')
      .eq('id', req.params.id)
      .maybeSingle();

    if (firstErr) throw firstErr;
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { data: recommendations, error: secondErr } = await supabase
      .from('products')
      .select('*')
      .eq('category', product.category)
      .neq('id', product.id)
      .order('rating_average', { ascending: false })
      .limit(4);

    if (secondErr) throw secondErr;

    res.json(recommendations.map(mapProductToFrontend));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const { title, description, price, category, images, inventoryCount, brand, isFlashSale, flashSalePrice } = req.body;

  if (!global.isDbConnected) {
    const created = {
      _id: `prod_${Math.random().toString(36).substring(2, 9)}`,
      title,
      description,
      price,
      category,
      brand: brand || 'Generic',
      images: images || ['/placeholder.jpg'],
      inventoryCount,
      isFlashSale,
      flashSalePrice,
      ratings: { average: 0, count: 0 },
      reviews: [],
      createdAt: new Date()
    };
    memoryProducts.push(created);
    return res.status(201).json(created);
  }

  try {
    const { data: createdProduct, error } = await supabase
      .from('products')
      .insert({
        title,
        description,
        price: Number(price),
        category,
        brand: brand || 'Generic',
        images: images || ['/placeholder.jpg'],
        inventory_count: Number(inventoryCount) || 0,
        is_flash_sale: isFlashSale || false,
        flash_sale_price: flashSalePrice ? Number(flashSalePrice) : null
      })
      .select()
      .single();

    if (error) throw error;

    checkAndEmitInventory(req, createdProduct);
    res.status(201).json(mapProductToFrontend(createdProduct));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const { title, description, price, category, images, inventoryCount, brand, isFlashSale, flashSalePrice } = req.body;

  if (!global.isDbConnected) {
    const idx = memoryProducts.findIndex(p => p._id === req.params.id);
    if (idx > -1) {
      const p = memoryProducts[idx];
      p.title = title || p.title;
      p.description = description || p.description;
      p.price = price !== undefined ? price : p.price;
      p.category = category || p.category;
      p.brand = brand || p.brand;
      p.images = images || p.images;
      p.inventoryCount = inventoryCount !== undefined ? inventoryCount : p.inventoryCount;
      p.isFlashSale = isFlashSale !== undefined ? isFlashSale : p.isFlashSale;
      p.flashSalePrice = flashSalePrice !== undefined ? flashSalePrice : p.flashSalePrice;
      return res.json(p);
    }
    return res.status(404).json({ message: 'Product not found' });
  }

  try {
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (category) updateData.category = category;
    if (images) updateData.images = images;
    if (inventoryCount !== undefined) updateData.inventory_count = Number(inventoryCount);
    if (brand) updateData.brand = brand;
    if (isFlashSale !== undefined) updateData.is_flash_sale = isFlashSale;
    if (flashSalePrice !== undefined) updateData.flash_sale_price = flashSalePrice ? Number(flashSalePrice) : null;

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    if (updatedProduct) {
      checkAndEmitInventory(req, updatedProduct);
      res.json(mapProductToFrontend(updatedProduct));
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  if (!global.isDbConnected) {
    const idx = memoryProducts.findIndex(p => p._id === req.params.id);
    if (idx > -1) {
      memoryProducts.splice(idx, 1);
      return res.json({ message: 'Product removed (sandbox)' });
    }
    return res.status(404).json({ message: 'Product not found' });
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  if (!global.isDbConnected) {
    const p = memoryProducts.find(p => p._id === req.params.id);
    if (p) {
      const alreadyReviewed = p.reviews.find(r => r.userId === req.user._id);
      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed by this user' });
      }
      const review = {
        _id: `rev_${Math.random().toString(36).substring(2, 9)}`,
        userId: req.user._id,
        userName: req.user.name,
        rating: Number(rating),
        comment,
        createdAt: new Date()
      };
      p.reviews.push(review);
      
      const sum = p.reviews.reduce((acc, r) => acc + r.rating, 0);
      p.ratings = {
        average: Math.round((sum / p.reviews.length) * 10) / 10,
        count: p.reviews.length
      };
      return res.status(201).json({ message: 'Review added (sandbox)' });
    }
    return res.status(404).json({ message: 'Product not found' });
  }

  try {
    const { data: product, error: findError } = await supabase
      .from('products')
      .select('reviews, rating_average, rating_count')
      .eq('id', req.params.id)
      .maybeSingle();

    if (findError) throw findError;
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = product.reviews || [];
    const alreadyReviewed = reviews.find(
      (r) => r.userId === req.user._id
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed by this user' });
    }

    const review = {
      userId: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString()
    };

    reviews.push(review);
    
    // Calculate new averages
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const rating_average = Math.round((sum / reviews.length) * 10) / 10;
    const rating_count = reviews.length;

    const { error: updateError } = await supabase
      .from('products')
      .update({ reviews, rating_average, rating_count })
      .eq('id', req.params.id);

    if (updateError) throw updateError;

    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get autocomplete search suggestions
// @route   GET /api/products/search/suggestions
// @access  Public
export const getSearchSuggestions = async (req, res) => {
  const { keyword } = req.query;
  if (!global.isDbConnected) {
    if (!keyword) return res.json([]);
    const kw = keyword.toLowerCase();
    const suggestions = memoryProducts
      .filter(p => p.title.toLowerCase().includes(kw))
      .slice(0, 8);
    return res.json(suggestions);
  }

  try {
    if (!keyword) {
      return res.json([]);
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('id, title, category')
      .ilike('title', `%${keyword}%`)
      .limit(8);

    if (error) throw error;

    res.json(products.map(p => ({
      _id: p.id,
      id: p.id,
      title: p.title,
      category: p.category
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Frequently Bought Together products
// @route   GET /api/products/:id/frequently-bought
// @access  Public
export const getFrequentlyBoughtTogether = async (req, res) => {
  if (!global.isDbConnected) {
    const product = memoryProducts.find(p => p._id === req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const matches = memoryProducts.filter(p => p._id !== product._id).slice(0, 3);
    return res.json(matches);
  }

  try {
    const { data: product, error: findError } = await supabase
      .from('products')
      .select('id, category')
      .eq('id', req.params.id)
      .maybeSingle();

    if (findError) throw findError;
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { data: matches, error } = await supabase
      .from('products')
      .select('*')
      .neq('id', product.id)
      .or(`category.eq."${product.category}",category.eq."Accessories"`)
      .order('rating_average', { ascending: false })
      .limit(3);

    if (error) throw error;

    res.json(matches.map(mapProductToFrontend));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Personalized Recommendations
// @route   GET /api/products/user/personalized
// @access  Private/Optional
export const getPersonalizedRecommendations = async (req, res) => {
  if (!global.isDbConnected) {
    return res.json(memoryProducts.slice(0, 4));
  }

  try {
    let categories = [];
    if (req.user) {
      const user = req.user;
      if (user.wishlist && user.wishlist.length > 0) {
        const { data: wishlistProducts, error } = await supabase
          .from('products')
          .select('category')
          .in('id', user.wishlist);
        if (!error && wishlistProducts) {
          categories = wishlistProducts.map(p => p.category);
        }
      }
    }

    let q = supabase.from('products').select('*');
    if (categories.length > 0) {
      q = q.in('category', categories);
    }

    const { data: recommendations, error } = await q
      .order('rating_average', { ascending: false })
      .order('rating_count', { ascending: false })
      .limit(6);

    if (error) throw error;

    res.json(recommendations.map(mapProductToFrontend));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
