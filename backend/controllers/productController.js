import Product from '../models/Product.js';
import { memoryProducts } from '../config/memoryStore.js';

// Helper to emit stock alerts if needed
const checkAndEmitInventory = (req, product) => {
  const io = req.app.get('socketio');
  if (io) {
    io.emit('inventoryUpdate', {
      productId: product._id,
      title: product.title,
      inventoryCount: product.inventoryCount
    });
    if (product.inventoryCount <= 5 && product.inventoryCount > 0) {
      io.emit('inventoryLow', {
        productId: product._id,
        title: product.title,
        inventoryCount: product.inventoryCount
      });
    } else if (product.inventoryCount === 0) {
      io.emit('inventoryOutOfStock', {
        productId: product._id,
        title: product.title
      });
    }
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

    // Sort
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
    } else if (sortBy === 'popular') {
      list.sort((a, b) => (b.ratings?.count || 0) - (a.ratings?.count || 0));
    } else {
      // Newest (Default)
      list.reverse();
    }

    return res.json(list);
  }

  try {
    let query = {};
    if (keyword) {
      const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      query.$or = [
        { title: { $regex: escapedKeyword, $options: 'i' } },
        { description: { $regex: escapedKeyword, $options: 'i' } },
        { category: { $regex: escapedKeyword, $options: 'i' } },
        { brand: { $regex: escapedKeyword, $options: 'i' } },
        { subCategory: { $regex: escapedKeyword, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (rating) query['ratings.average'] = { $gte: Number(rating) };
    if (inStock === 'true') query.inventoryCount = { $gt: 0 };
    if (colors) query.colors = { $in: colors.split(',') };
    if (sizes) query.sizes = { $in: sizes.split(',') };
    if (isFlashSale === 'true') query.isFlashSale = true;

    let sortOptions = {};
    if (sortBy === 'price-asc') sortOptions.price = 1;
    else if (sortBy === 'price-desc') sortOptions.price = -1;
    else if (sortBy === 'rating') sortOptions['ratings.average'] = -1;
    else if (sortBy === 'popular') sortOptions['ratings.count'] = -1;
    else sortOptions.createdAt = -1;

    const products = await Product.find(query).sort(sortOptions);
    res.json(products);
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
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recommendations ("You May Also Like")
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
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const recommendations = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    })
      .sort({ 'ratings.average': -1 })
      .limit(4);

    res.json(recommendations);
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
    const product = new Product({
      title,
      description,
      price,
      category,
      brand,
      images: images || ['/placeholder.jpg'],
      inventoryCount,
      isFlashSale,
      flashSalePrice
    });

    const createdProduct = await product.save();
    checkAndEmitInventory(req, createdProduct);
    res.status(201).json(createdProduct);
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
    const product = await Product.findById(req.params.id);

    if (product) {
      product.title = title || product.title;
      product.description = description || product.description;
      product.price = price !== undefined ? price : product.price;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.images = images || product.images;
      product.inventoryCount = inventoryCount !== undefined ? inventoryCount : product.inventoryCount;
      product.isFlashSale = isFlashSale !== undefined ? isFlashSale : product.isFlashSale;
      product.flashSalePrice = flashSalePrice !== undefined ? flashSalePrice : product.flashSalePrice;

      const updatedProduct = await product.save();
      checkAndEmitInventory(req, updatedProduct);
      res.json(updatedProduct);
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
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
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
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.userId.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed by this user' });
      }

      const review = {
        userId: req.user._id,
        userName: req.user.name,
        rating: Number(rating),
        comment
      };

      product.reviews.push(review);
      product.calculateRatings();

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
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
    const products = await Product.find({
      title: { $regex: keyword, $options: 'i' }
    }).select('title category').limit(8);

    res.json(products);
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
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const matches = await Product.find({
      _id: { $ne: product._id },
      $or: [
        { category: product.category },
        { category: 'Accessories' }
      ]
    })
      .sort({ 'ratings.average': -1 })
      .limit(3);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Personalized Recommendations based on User history/wishlist
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
        const wishlistProducts = await Product.find({ _id: { $in: user.wishlist } });
        categories = wishlistProducts.map(p => p.category);
      }
    }

    let query = {};
    if (categories.length > 0) {
      query.category = { $in: categories };
    }

    const recommendations = await Product.find(query)
      .sort({ 'ratings.average': -1, 'ratings.count': -1 })
      .limit(6);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
