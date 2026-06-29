import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { seedDB } from './config/seed.js';

// Route imports
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import categoryRoutes from './routes/categories.js';
import brandRoutes from './routes/brands.js';
import couponRoutes from './routes/coupons.js';
import ticketRoutes from './routes/tickets.js';
import notificationRoutes from './routes/notifications.js';
import navigationRoutes from './routes/navigation.js';
import { protect } from './middleware/auth.js';

dotenv.config();

// Connect to MongoDB
connectDB().then(() => {
  // Seed Database with sample data
  seedDB();
});

const app = express();
const server = http.createServer(app);

// Enable CORS dynamic origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'https://e-commerce-shopping-website-b517yazca.vercel.app'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.includes('localhost') || 
                      origin.includes('127.0.0.1') || 
                      origin.endsWith('vercel.app');
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Body parser
app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.endsWith('vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Set socketio instance on express app so we can use it in controller endpoints
app.set('socketio', io);

// Handle WebSockets connection events
io.on('connection', (socket) => {
  console.log(`WebSocket client connected: ${socket.id}`);

  // Socket chat messaging listener
  socket.on('supportMessage', (messageData) => {
    // Broadcast reply
    io.emit(`supportMessage_${messageData.ticketId}`, messageData);
  });

  socket.on('disconnect', () => {
    console.log(`WebSocket client disconnected: ${socket.id}`);
  });
});

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', navigationRoutes);

// Custom Premium E-Commerce Navigation Endpoints
app.get('/api/currency', (req, res) => {
  res.json([
    { country: 'India', currency: 'INR', symbol: '₹', exchangeRate: 83, shippingFee: 80, taxRate: 0.18, estDelivery: '2-4 Days' },
    { country: 'USA', currency: 'USD', symbol: '$', exchangeRate: 1, shippingFee: 5, taxRate: 0.08, estDelivery: '3-5 Days' },
    { country: 'Europe', currency: 'Europe', symbol: '€', exchangeRate: 0.92, shippingFee: 6, taxRate: 0.12, estDelivery: '4-7 Days' }
  ]);
});

app.get('/api/deals', (req, res) => {
  res.json([
    { label: "Today's Deals", path: "/shop?tag=deal", badge: 'HOT' },
    { label: "Flash Sale", path: "/shop?isFlashSale=true", badge: 'SALE' },
    { label: "Clearance", path: "/shop?tag=clearance", badge: '90% OFF' },
    { label: "Coupons", path: "/dashboard?tab=coupons", badge: 'COUPON' },
    { label: "Best Sellers", path: "/shop?sortBy=rating", badge: 'BEST' },
    { label: "Trending", path: "/shop?sortBy=trending", badge: 'NEW' }
  ]);
});

app.get('/api/search', async (req, res) => {
  const { keyword } = req.query;
  if (!keyword) return res.json([]);
  if (!global.isDbConnected) {
    const { memoryProducts } = await import('./config/memoryStore.js');
    const kw = keyword.toLowerCase();
    const results = memoryProducts.filter(p => 
      p.title.toLowerCase().includes(kw) || 
      p.description.toLowerCase().includes(kw) ||
      p.category.toLowerCase().includes(kw) ||
      p.brand.toLowerCase().includes(kw)
    );
    return res.json(results);
  }
  try {
    const { supabase } = await import('./config/supabase.js');
    const { data: results, error } = await supabase
      .from('products')
      .select('*')
      .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,category.ilike.%${keyword}%,brand.ilike.%${keyword}%`)
      .limit(20);
    if (error) throw error;
    
    res.json(results.map(prod => ({
      _id: prod.id,
      id: prod.id,
      title: prod.title,
      description: prod.description,
      price: Number(prod.price) || 0,
      category: prod.category,
      brand: prod.brand || 'Generic',
      images: prod.images || [],
      ratings: {
        average: Number(prod.rating_average) || 0,
        count: prod.rating_count || 0
      }
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/wishlist', protect, async (req, res) => {
  if (!global.isDbConnected) {
    const { memoryProducts } = await import('./config/memoryStore.js');
    const wishListItems = memoryProducts.filter(p => req.user.wishlist.includes(p._id));
    return res.json(wishListItems);
  }
  try {
    const { supabase } = await import('./config/supabase.js');
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('wishlist')
      .eq('id', req.user._id)
      .single();

    if (profileError) throw profileError;

    const wishlistIds = userProfile.wishlist || [];
    if (wishlistIds.length === 0) {
      return res.json([]);
    }

    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .in('id', wishlistIds);

    if (prodError) throw prodError;

    res.json(products.map(prod => ({
      _id: prod.id,
      id: prod.id,
      title: prod.title,
      description: prod.description,
      price: Number(prod.price) || 0,
      category: prod.category,
      brand: prod.brand || 'Generic',
      images: prod.images || [],
      ratings: {
        average: Number(prod.rating_average) || 0,
        count: prod.rating_count || 0
      }
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/user/profile', protect, (req, res) => {
  res.json(req.user);
});

// Simple root healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5050;
// Server initialized successfully - trigger reload and seed
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

