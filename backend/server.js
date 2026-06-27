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

dotenv.config();

// Connect to MongoDB
connectDB().then(() => {
  // Seed Database with sample data
  seedDB();
});

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
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

