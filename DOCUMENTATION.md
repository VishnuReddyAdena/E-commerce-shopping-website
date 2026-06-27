# NexaCart – Modern Full-Stack E-Commerce Shopping Platform
## Complete Final Year CSE Project Documentation

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Introduction & Problem Statement](#2-introduction--problem-statement)
3. [System Architecture Diagram](#3-system-architecture-diagram)
4. [Technology Stack & Justification](#4-technology-stack--justification)
5. [Database Schema Design](#5-database-schema-design)
6. [Backend API Reference](#6-backend-api-reference)
7. [Frontend Component Architecture](#7-frontend-component-architecture)
8. [Key Features Implementation](#8-key-features-implementation)
9. [Security Implementation](#9-security-implementation)
10. [Deployment & Environment Setup](#10-deployment--environment-setup)
11. [Sandbox Failover Mode](#11-sandbox-failover-mode)
12. [Viva Q&A – 25 Questions](#12-viva-qa--25-questions)

---

## 1. Abstract

**NexaCart** is a production-ready, enterprise-grade Full-Stack E-Commerce Shopping Platform built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) with Supabase-compatible architecture, Razorpay payment gateway integration, and real-time capabilities via **Socket.IO**. The platform delivers a seamless online shopping experience for customers while providing powerful management tools for administrators.

Inspired by the scale and functionality of major platforms like Flipkart and Amazon, NexaCart introduces a **unique premium Glassmorphic Light Mode design language** — featuring soft 3D UI elements, micro-animations (powered by Framer Motion), and deep product interactivity — that distinguishes it from conventional e-commerce templates.

**Core Technical Highlights:**
- Full-stack MERN implementation with dual-mode operation (MongoDB or in-memory sandbox)
- Real-time inventory updates and chat support via WebSockets (Socket.IO)
- JWT-based authentication with optional Google OAuth integration
- Simulated Razorpay payment gateway with fallback sandbox checkout
- Admin analytics dashboard powered by Recharts (revenue, orders, top products)
- Redux Toolkit for global state management (comparisons, recently viewed)
- Coupon/promo code engine with automatic discount calculations
- Loyalty points ledger and wallet balance system
- Product comparison matrix (side-by-side specification viewer)
- AI-curated personalized product recommendations

The platform demonstrates end-to-end software engineering excellence: database modelling, RESTful API design, state management, UI/UX engineering, real-time communication, security, and graceful offline failover — making it a comprehensive CSE final year project.

---

## 2. Introduction & Problem Statement

### 2.1 Background

E-commerce has transformed global retail. With platforms generating trillions in annual GMV (Gross Merchandise Value), understanding how to build scalable online marketplaces is among the most commercially-relevant skills for a Computer Science graduate.

Traditional course projects often build isolated subsystems (a product listing, or a login system). NexaCart takes a holistic, production-inspired approach: every layer from database schema to pixel-level UI animations is engineered with real-world patterns.

### 2.2 Problem Statement

Existing educational e-commerce projects commonly suffer from:
- Incomplete feature coverage (no cart, or no admin panel)
- Outdated UI patterns without responsive design
- No real-time capabilities or payment simulation
- No graceful handling of infrastructure failures (offline DB)
- Generic aesthetics not suitable for modern product demonstration

NexaCart solves all of these by delivering:
- A complete end-to-end shopping experience (browse → add-to-cart → checkout → order tracking)
- A robust admin control panel (product CRUD, analytics, coupon management, user moderation)
- Premium Glassmorphic UI using industry best practices in 2024/2025 design
- Graceful offline failover using an in-memory sandbox store — the app works fully even without a database

### 2.3 Project Goals

| Goal | Status |
|------|--------|
| Full shopping flow (browse, cart, checkout, order) | ✅ Complete |
| Admin dashboard with analytics | ✅ Complete |
| Real-time inventory updates (Socket.IO) | ✅ Complete |
| Payment simulation (Razorpay sandbox) | ✅ Complete |
| Authentication (JWT + optional Google OAuth) | ✅ Complete |
| Coupon engine | ✅ Complete |
| Loyalty wallet system | ✅ Complete |
| Product comparisons | ✅ Complete |
| Live chat support simulation | ✅ Complete |
| In-memory failover sandbox | ✅ Complete |
| Premium Glassmorphic UI | ✅ Complete |

---

## 3. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  CLIENT (React.js / Vite)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React Router v6  │  Redux Toolkit  │  AppContext │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Pages: Home, Shop, ProductDetail, Checkout,     │   │
│  │         Dashboard, AdminDashboard, VerifyEmail   │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Components: Navbar, AuthModal, CartDrawer,      │   │
│  │    CheckoutForm, LiveChat, ProductCompare,       │   │
│  │    ProductCard                                   │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Styling: Tailwind CSS + Custom Glassmorphic     │   │
│  │           Design System (index.css)              │   │
│  └──────────────────────────────────────────────────┘   │
│                           │                              │
│                    HTTP REST + WS                        │
└───────────────────────────┼─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│              SERVER (Node.js + Express.js)               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Routes: /api/auth, /api/products, /api/cart,    │   │
│  │          /api/orders, /api/payments,             │   │
│  │          /api/categories, /api/brands,           │   │
│  │          /api/coupons, /api/tickets,             │   │
│  │          /api/notifications                      │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Middleware: JWT Auth, Admin Guard, Body Parser  │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Socket.IO: Real-time Inventory + Chat Events   │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Integrations: Razorpay, Nodemailer (mock)      │   │
│  └──────────────────────────────────────────────────┘   │
│                           │                              │
│              ┌────────────┴──────────────┐               │
│              │                           │               │
│   ┌──────────▼──────────┐   ┌────────────▼──────────┐   │
│   │  MongoDB (Primary)  │   │  memoryStore.js       │   │
│   │  Mongoose ODM       │   │  (Sandbox Failover)   │   │
│   │  Models: User,      │   │  In-memory Arrays +   │   │
│   │  Product, Order,    │   │  Pre-seeded Data      │   │
│   │  Category, Brand,   │   │                       │   │
│   │  Coupon, Cart,      │   │                       │   │
│   │  Notification,      │   │                       │   │
│   │  SupportTicket      │   │                       │   │
│   └─────────────────────┘   └───────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3.1 Data Flow Overview

```
User Action → React Component → AppContext Method → fetch() API call
    → Express Route → Middleware (JWT verify) → Controller
    → DB Query (MongoDB OR memoryStore) → JSON Response
    → AppContext State Update → React Re-render → Updated UI
```

### 3.2 Real-Time Event Flow (Socket.IO)

```
Order Placed → orderController → product.inventoryCount-- → io.emit('inventoryUpdate')
    → All connected clients receive event → AppContext socket listener
    → Cart updated if affected → Toast notification shown to user
```

---

## 4. Technology Stack & Justification

### 4.1 Frontend

| Technology | Version | Why Chosen |
|-----------|---------|------------|
| **React.js** | 18.3 | Industry-standard component-based SPA framework with hooks ecosystem |
| **Vite** | 5.x | Ultra-fast HMR dev server, ES module-first bundler (10x faster than CRA) |
| **Tailwind CSS** | 3.4 | Utility-first CSS enables rapid, consistent UI development with design tokens |
| **Framer Motion** | 12.x | Production-quality declarative animations for React — gesture, spring, layout animations |
| **Redux Toolkit** | 2.x | Simplified, opinionated Redux with `createSlice` for predictable global state |
| **React Router DOM** | 6.x | Declarative client-side routing with nested layouts and URL params |
| **Recharts** | 2.x | Composable SVG chart library optimized for React — used in admin analytics |
| **Socket.IO Client** | 4.x | Real-time bidirectional communication with automatic reconnection |
| **Lucide React** | 0.379 | Consistent, tree-shakeable icon library (700+ clean icons) |
| **React Hook Form** | 7.x | Performant forms with minimal re-renders and built-in validation |
| **Axios** | 1.x | HTTP client with interceptors, better error handling than fetch |
| **@tanstack/react-query** | 5.x | Server state management, caching, background refetching |
| **canvas-confetti** | 1.9 | Lightweight confetti animation for order success celebrations |
| **jsPDF** | 2.5 | Client-side PDF generation for invoice downloads |

### 4.2 Backend

| Technology | Version | Why Chosen |
|-----------|---------|------------|
| **Node.js** | 20.x LTS | Non-blocking I/O event loop — ideal for API servers with concurrent requests |
| **Express.js** | 4.19 | Minimal, unopinionated Node.js web framework; industry standard for REST APIs |
| **MongoDB** | (Atlas/Local) | Document-oriented NoSQL — flexible schema for product variants and nested reviews |
| **Mongoose** | 8.4 | Elegant MongoDB ODM with schema enforcement, virtuals, and middleware hooks |
| **Socket.IO** | 4.7 | WebSocket library with long-polling fallback — enables real-time inventory/chat |
| **JWT (jsonwebtoken)** | 9.0 | Stateless authentication token — scales horizontally without session stores |
| **bcryptjs** | 2.4 | Secure password hashing using adaptive cost factor (10 rounds) |
| **Razorpay** | 2.9 | Leading Indian payment gateway — HMAC-SHA256 signature verification |
| **Nodemailer** | 9.0 | Node email client — used for email verification flow simulation |
| **google-auth-library** | 10.7 | Google OAuth2 ID token verification for social sign-in |
| **dotenv** | 16.4 | Environment variable loading from `.env` for 12-Factor App compliance |
| **cors** | 2.8 | Express CORS middleware with origin whitelisting |

### 4.3 Design System Rationale

The **Glassmorphic Light Mode** was chosen for the following UX reasons:

1. **Light Mode Only**: Maximizes accessibility and print-readiness; simpler contrast compliance
2. **Glassmorphism**: `backdrop-filter: blur(20px)` on `rgba(255,255,255,0.65)` backgrounds creates visual depth without heavy textures — elegant for premium brand positioning
3. **24px Border Radius**: Creates approachable, modern feel vs. sharp corners (associated with aggressive or outdated interfaces)
4. **Inter + Poppins Fonts**: Inter (body) is optimized for screen legibility; Poppins (headings) provides contemporary geometric character
5. **Micro-animations**: `translateY(-6px)` on card hover provides tactile feedback — proven to improve conversion rates by 15-20%

---

## 5. Database Schema Design

### 5.1 User Schema (`models/User.js`)

```javascript
{
  name:                    String (required)
  email:                   String (required, unique, lowercase)
  password:                String (bcrypt hashed, 10 rounds)
  role:                    String (enum: ['user', 'admin'], default: 'user')
  isEmailVerified:         Boolean (default: false)
  emailVerificationToken:  String (SHA256 hash)
  emailVerificationExpires: Date
  shippingAddresses: [{
    street, city, state, zip, country: String
    isDefault: Boolean
  }]
  wishlist:                [ObjectId → Product]
  walletBalance:           Number (default: 100, gifted on signup)
  loyaltyPoints:           Number (earned at 10% of order value)
  referralCode:            String (unique, auto-generated: 'REF-XXXXX')
  referredBy:              ObjectId → User
  isBanned:                Boolean (admin-controlled)
  createdAt, updatedAt:    Date (Mongoose timestamps)
}
```

**Key Design Decisions:**
- Passwords use bcrypt with cost factor 10 — approximately 100ms hash time, thwarting brute force
- `emailVerificationToken` stores the SHA256 hash of the verification token (raw token is sent by email only)
- Wallet and loyalty points are first-class fields enabling gamification features
- `isBanned` supports instant account suspension without deletion (audit trail preserved)

### 5.2 Product Schema (`models/Product.js`)

```javascript
{
  title:          String (required)
  description:    String (required)
  price:          Number (required, min: 0)
  category:       String (Electronics, Apparel, Accessories, Home)
  brand:          String
  images:         [String] (URLs)
  inventoryCount: Number (default: 0, min: 0)
  colors:         [String]
  sizes:          [String]
  specifications: Map (String → String, flexible key-value pairs)
  isFlashSale:    Boolean
  flashSalePrice: Number
  ratings: {
    average: Number (0-5, recalculated on each review)
    count:   Number
  }
  reviews: [{
    userId:    ObjectId → User
    userName:  String (denormalized for read performance)
    rating:    Number (1-5)
    comment:   String
    createdAt: Date
  }]
  createdAt, updatedAt: Date
}
```

**Key Design Decisions:**
- `specifications` uses MongoDB Map type — allows dynamic per-product spec keys (e.g., headphones have `driver`, keyboards have `switches`)
- Reviews are embedded (not referenced) — suitable because review counts per product are bounded; enables single-query product+review fetch
- `ratings.average` is recalculated on every review addition via a `calculateRatings()` instance method
- `flashSalePrice` is separate from `price` — frontend shows original price crossed out vs. flash sale price

### 5.3 Order Schema (`models/Order.js`)

```javascript
{
  userId: ObjectId → User (ref)
  items: [{
    productId:  ObjectId → Product
    title:      String (snapshot at time of order)
    price:      Number (snapshot at time of order)
    quantity:   Number
    image:      String
  }]
  totalAmount:    Number
  shippingAddress: { street, city, state, zip, country }
  paymentIntentId: String (Razorpay payment_id)
  paymentStatus:   String (enum: ['pending','paid','failed'])
  orderStatus:     String (enum: ['Processing','Shipped','Delivered','Cancelled'])
  couponApplied:   String
  discountAmount:  Number
  createdAt, updatedAt: Date
}
```

**Key Design Decisions:**
- Product `title`, `price`, and `image` are **denormalized snapshots** in order items — this is critical; if a product price changes after an order, the order history should reflect the price paid at purchase time
- `paymentStatus` and `orderStatus` are kept separate — payment can be `paid` while order is still `Processing`

### 5.4 Category Schema (`models/Category.js`)

```javascript
{
  name:        String (required, unique)
  description: String
  image:       String (URL)
  isActive:    Boolean (default: true)
}
```

### 5.5 Brand Schema (`models/Brand.js`)

```javascript
{
  name:        String (required, unique)
  logo:        String (URL)
  description: String
  isActive:    Boolean (default: true)
}
```

### 5.6 Coupon Schema (`models/Coupon.js`)

```javascript
{
  code:          String (required, unique, uppercase)
  discountType:  String (enum: ['percent','fixed'])
  discountValue: Number (required)
  expiryDate:    Date
  usageLimit:    Number (default: 100)
  usedCount:     Number (default: 0)
  isActive:      Boolean (default: true)
}
```

### 5.7 SupportTicket Schema (`models/SupportTicket.js`)

```javascript
{
  userId:      ObjectId → User
  subject:     String
  description: String
  status:      String (enum: ['Open','In Progress','Resolved'])
  messages: [{
    sender: String ('user' | 'admin')
    text:   String
    sentAt: Date
  }]
  createdAt, updatedAt: Date
}
```

### 5.8 Notification Schema (`models/Notification.js`)

```javascript
{
  userId:     ObjectId → User
  title:      String
  message:    String
  type:       String (enum: ['info','success','warning','error'])
  readStatus: Boolean (default: false)
  createdAt:  Date
}
```

### 5.9 Cart Schema (`models/Cart.js`)

```javascript
{
  userId: ObjectId → User (unique — one cart per user)
  items: [{
    productId: ObjectId → Product
    quantity:  Number
  }]
  updatedAt: Date
}
```

---

## 6. Backend API Reference

**Base URL:** `http://localhost:5050/api`

### 6.1 Authentication Routes (`/auth`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| POST | `/auth/register` | No | Register new user (+ referral code support) |
| POST | `/auth/verify-email` | No | Verify email with token |
| POST | `/auth/login` | No | Login and receive JWT token |
| POST | `/auth/google` | No | Google OAuth sign-in |
| GET | `/auth/profile` | User | Get authenticated user profile |
| POST | `/auth/addresses` | User | Add shipping address |
| POST | `/auth/wishlist` | User | Toggle wishlist item |
| POST | `/auth/forgot-password` | No | Initiate password reset |
| POST | `/auth/reset-password/:token` | No | Complete password reset |
| GET | `/auth/users` | Admin | Get all users list |
| PUT | `/auth/users/:id/role` | Admin | Update user role |
| PUT | `/auth/users/:id/ban` | Admin | Toggle user ban status |
| DELETE | `/auth/users/:id` | Admin | Delete user account |

### 6.2 Product Routes (`/products`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| GET | `/products` | No | List all products (with filters: keyword, category, brand, price, rating, flash sale) |
| GET | `/products/search/suggestions` | No | Autocomplete suggestions by keyword |
| GET | `/products/user/personalized` | Optional | Personalized recommendations based on wishlist |
| GET | `/products/:id` | No | Get single product detail |
| GET | `/products/:id/recommendations` | No | Similar products in same category |
| GET | `/products/:id/frequently-bought` | No | Frequently bought together |
| POST | `/products/:id/reviews` | User | Submit product review |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |

**Filter Query Parameters (GET /products):**
```
?keyword=headphones   → Full-text search across title, description, category, brand
?category=Electronics → Filter by category name
?brand=AeroSound      → Filter by brand name
?minPrice=100         → Minimum price filter
?maxPrice=500         → Maximum price filter
?rating=4             → Minimum average rating
?inStock=true         → Only in-stock products
?isFlashSale=true     → Only flash sale products
?sortBy=price-asc     → Sort: price-asc | price-desc | rating | popular | newest
```

### 6.3 Cart Routes (`/cart`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| GET | `/cart` | User | Get current user's cart |
| PUT | `/cart` | User | Sync cart (full replace) |
| DELETE | `/cart` | User | Clear cart |

### 6.4 Order Routes (`/orders`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| POST | `/orders` | User | Create order (decrements stock, credits loyalty) |
| GET | `/orders/myorders` | User | Get current user's orders |
| GET | `/orders/:id` | User/Admin | Get specific order details |
| GET | `/orders` | Admin | Get all orders |
| PUT | `/orders/:id/status` | Admin | Update order status |
| GET | `/orders/analytics/stats` | Admin | Revenue analytics with daily breakdown |

### 6.5 Payment Routes (`/payments`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| POST | `/payments/create-order` | User | Create Razorpay order |
| POST | `/payments/verify` | User | Verify Razorpay HMAC-SHA256 signature |
| POST | `/payments/simulate` | User | Simulate successful payment (sandbox) |

### 6.6 Supporting Routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/categories` | GET, POST, PUT/:id, DELETE/:id | Category CRUD |
| `/brands` | GET, POST, PUT/:id, DELETE/:id | Brand CRUD |
| `/coupons` | GET, POST, PUT/:id, DELETE/:id | Coupon CRUD |
| `/coupons/validate` | POST | Validate coupon code and return discount |
| `/tickets` | GET, POST | Create/list support tickets |
| `/tickets/mytickets` | GET | Current user's tickets |
| `/tickets/:id/reply` | POST | Add message to ticket |
| `/notifications` | GET, DELETE | User notifications |
| `/notifications/:id/read` | PUT | Mark notification as read |

---

## 7. Frontend Component Architecture

### 7.1 Global State Management

**AppContext** (`context/AppContext.jsx`) — The primary state manager using React Context API:

```
AppContext provides:
├── auth: { user, token, login, register, googleLogin, logout }
├── cart: { cart, addToCart, removeFromCart, updateQuantity, clearCart }
├── promo: { promoCode, promoDiscount, promoDiscountType, validatePromoCode }
├── wishlist: { wishlist, toggleWishlist }
├── filters: { filters, setFilters }
├── notifications: { notifications, dbNotifications, addNotification, dismissNotification }
├── tickets: { tickets, createTicket, replyToTicket }
├── data: { categories, brands }
├── socket: Socket.IO client instance
└── calculations: { getSubtotal, getDiscountAmount, getTotal }
```

**Redux Store** (`store/index.js`) — Supplemental global state:
```
Redux Slices:
├── recentlyViewed: { items[] } — Last 10 viewed products (persisted in slice state)
└── compareList: { items[] }  — Products added to comparison drawer
```

### 7.2 Page Components

#### `Home.jsx`
- **Hero Banner Carousel**: 3-slide auto-rotating gradient banner with arrow controls
- **Flash Sale Shelf**: Products filtered `isFlashSale=true` with live countdown timer
- **AI Picks Section**: Personalized recommendations from `/api/products/user/personalized`
- **Category Grid Pills**: Clickable category icons linking to pre-filtered Shop page
- **Recently Viewed**: Redux `recentlyViewed` slice horizontal scroll shelf
- **New Arrivals + Bestsellers**: Two-column grid layout

#### `Shop.jsx`
- **Faceted Sidebar**: Category, brand, price range sliders, rating stars, size, color, in-stock toggle
- **Search Bar**: Keyword + debounced API call
- **Sort Controls**: Price, Rating, Popularity, Newest
- **Product Grid**: 3-column responsive card grid
- **Active Filter Pills**: Shows applied filters with individual dismiss buttons
- **URL-Driven Filters**: Supports `?category=`, `?isFlashSale=true` from other pages

#### `ProductDetail.jsx`
- **Image Gallery**: Primary + thumbnail strip with zoom-on-hover effect (cursor tracks mouse position)
- **Variant Selectors**: Color swatches and size pills
- **Add to Cart / Wishlist**: With stock validation
- **Specifications Table**: Dynamic key-value pairs from `product.specifications`
- **Reviews Section**: Star ratings, user names, review text; submit review form
- **Similar Products**: Fetched from `/recommendations` endpoint
- **Frequently Bought Together**: Fetched from `/frequently-bought` endpoint
- **Compare Button**: Adds product to Redux `compareList`
- **Recently Viewed Tracking**: Dispatches to Redux on page load

#### `Dashboard.jsx` (Customer)
- **Order Timeline Tracker**: Visual status indicators (Processing → Shipped → Delivered)
- **Wallet Balance Panel**: Shows wallet balance, transaction history
- **Loyalty Points Ledger**: Points earned per order, total balance
- **Referral Program**: Unique referral code copy button
- **Shipping Addresses**: CRUD for saved delivery addresses
- **Wishlist Manager**: Listed wishlist items with quick-add-to-cart
- **Notification Inbox**: Persistent DB notifications with mark-as-read
- **Support Tickets**: Ticket creation and reply message thread

#### `AdminDashboard.jsx`
- **Analytics Overview Cards**: Total Revenue, Total Orders, Active Orders (Processing + Shipped)
- **Revenue Chart**: Recharts `AreaChart` with 7-day daily revenue data
- **Top Products Bar Chart**: `BarChart` showing top 5 sellers by quantity
- **Products CRUD**: Full table with add/edit/delete modal forms
- **Categories Manager**: CRUD with image URLs
- **Brands Manager**: CRUD with logo URLs
- **Coupon Manager**: Create/deactivate discount codes
- **Orders Manager**: Update order status (Processing → Shipped → Delivered → Cancelled)
- **Users Manager**: View all users, change roles, ban/unban, delete
- **Support Tickets Panel**: All open tickets with admin reply functionality

#### `CheckoutForm.jsx`
- **Multi-Step Stepper**: Step 1 (Shipping Address) → Step 2 (Payment) → Step 3 (Confirmation)
- **Address Form**: Pre-populated from saved addresses; new address option
- **Payment Methods**:
  - Razorpay (opens popup with simulated checkout)
  - Wallet (deducts from wallet balance)
  - Cash on Delivery
- **Coupon Input**: Apply codes with instant discount preview
- **Order Summary Panel**: Live-updating totals as coupon/wallet applied
- **Confetti Animation**: canvas-confetti celebration on successful order

### 7.3 Global Component Overlays

#### `Navbar.jsx`
- Glassmorphic sticky header with blur backdrop
- Voice Search: Web Speech API (`window.SpeechRecognition`) — microphone icon activates continuous transcript, auto-populates search
- Search Suggestions: Debounced autocomplete dropdown from `/api/products/search/suggestions`
- Notification Bell: Badge count + dropdown list of `dbNotifications`
- Cart Count Badge: Live count from AppContext cart state
- User Menu Dropdown: Profile, Dashboard, Admin Panel, Logout links

#### `CartDrawer.jsx`
- Slide-in drawer from right with blur backdrop overlay
- Product thumbnails, names, price per unit
- Quantity +/- with stock limit enforcement
- Remove item button
- Promo code input field
- Subtotal, Discount, and Total calculation display
- Proceed to Checkout button

#### `AuthModal.jsx`
- Glass modal with Login / Register / Forgot Password tabs
- Form validation (email format, password strength)
- Google Sign-In button integration
- Referral code field on registration
- Error display

#### `LiveChat.jsx`
- Floating action button (bottom-right)
- Chat bubble UI with typing indicator simulation
- Automated agent reply after 1.5s delay (support agent simulation)
- Message thread with timestamps

#### `ProductCompare.jsx`
- Sticky bottom bar showing count of products added to compare (max 4)
- Expand to modal: side-by-side specification comparison table
- Dynamic rows for each specification key found across compared products
- Price, rating, stock indicators
- "Add to Cart" from compare view

---

## 8. Key Features Implementation

### 8.1 Real-Time Inventory (Socket.IO)

When an order is placed, the order controller decrements inventory and emits three events:

```javascript
// In orderController.js & productController.js
io.emit('inventoryUpdate', { productId, title, inventoryCount });

if (inventoryCount <= 5 && inventoryCount > 0) {
  io.emit('inventoryLow', { productId, title, inventoryCount });
} else if (inventoryCount === 0) {
  io.emit('inventoryOutOfStock', { productId, title });
}
```

On the frontend (AppContext), listeners handle these:
- `inventoryUpdate` → Updates cart item counts if product is in cart
- `inventoryLow` → Shows warning toast notification ("Only N items left!")
- `inventoryOutOfStock` → Removes product from cart, shows error toast

### 8.2 Razorpay Payment Flow

```
1. Frontend calls POST /api/payments/create-order { amount }
2. Backend creates Razorpay order via SDK: razorpay.orders.create({amount, currency, receipt})
3. Frontend opens Razorpay popup with order details + key
4. User completes payment in popup
5. Frontend receives { razorpay_payment_id, razorpay_order_id, razorpay_signature }
6. Frontend calls POST /api/payments/verify with all three fields
7. Backend verifies HMAC-SHA256: crypto.createHmac('sha256', keySecret)
                                        .update(orderId + '|' + paymentId).digest('hex')
8. If signature matches → payment confirmed
9. Frontend calls POST /api/orders with paymentIntentId and paymentStatus: 'paid'
```

**Sandbox Simulation**: When Razorpay credentials are missing, `POST /api/payments/simulate` returns a mock `{ paymentId, orderId, signature }` tuple, allowing testing without real credentials.

### 8.3 Coupon Discount Engine

```
POST /api/coupons/validate { code }
→ Checks: code exists, isActive, !expired, usedCount < usageLimit
→ Returns: { discountType: 'percent' | 'fixed', discountValue }

Frontend calculation:
- If 'percent': discountAmount = (subtotal * discountValue) / 100
- If 'fixed':   discountAmount = Math.min(subtotal, discountValue)
- total = subtotal - discountAmount
```

### 8.4 Loyalty Points System

```
On each successful order:
  pointsEarned = Math.round(totalAmount * 0.1)  // 10% of order value
  user.loyaltyPoints += pointsEarned

Wallet:
  New users get ₹100 wallet credit on signup
  Referral bonus: +₹50 to referrer, referred user gets ₹150 (₹100 + ₹50 bonus)
  Wallet can be used to partially or fully pay for orders at checkout
```

### 8.5 Voice Search (Web Speech API)

```javascript
// In Navbar.jsx
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = false;
recognition.interimResults = true;
recognition.lang = 'en-US';

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  setSearchQuery(transcript);  // Auto-populates search box
};
recognition.start();
```

Fallback: If browser doesn't support SpeechRecognition, the mic button is hidden gracefully.

### 8.6 Product Comparison Engine

Products are added to Redux `compareList` slice from any ProductCard component. The `ProductCompare` overlay reads this slice and:
1. Collects all unique spec keys across compared products
2. Renders a table with products as columns and spec keys as rows
3. Highlights cells where values differ (visual diff)
4. Maximum 4 products can be compared simultaneously

### 8.7 Admin Analytics Aggregation

When MongoDB is connected, analytics use MongoDB Aggregation Pipeline:
```javascript
// Revenue totals
Order.aggregate([
  { $match: { paymentStatus: 'paid' } },
  { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
])

// Daily revenue (7 days)
Order.aggregate([
  { $match: { paymentStatus: 'paid', createdAt: { $gte: sevenDaysAgo } } },
  { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
  { $sort: { _id: 1 } }
])

// Top selling products
Order.aggregate([
  { $match: { paymentStatus: 'paid' } },
  { $unwind: '$items' },
  { $group: { _id: '$items.productId', title: { $first: '$items.title' },
              quantitySold: { $sum: '$items.quantity' },
              totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
  { $sort: { quantitySold: -1 } },
  { $limit: 5 }
])
```

In sandbox mode, equivalent JavaScript array operations run on `memoryOrders`.

---

## 9. Security Implementation

### 9.1 Authentication & Authorization

```javascript
// middleware/auth.js
export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];  // Bearer <token>
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id).select('-password');
  next();
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};
```

- **JWT Tokens**: 30-day expiry, signed with `JWT_SECRET` environment variable
- **Route Protection**: All mutating endpoints require `protect` middleware
- **Admin Guard**: All admin routes require `protect` + `adminOnly` middleware
- **Token Storage**: Stored in `localStorage` (suitable for SPA; no XSS vectors in this project scope)

### 9.2 Password Security

```javascript
// In User model
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);  // 10 rounds
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

### 9.3 Razorpay Signature Verification

```javascript
// In paymentController.js
const generated = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest('hex');

if (generated !== razorpay_signature) {
  return res.status(400).json({ message: 'Invalid payment signature' });
}
```

### 9.4 Email Verification Token Security

```javascript
// Raw token is never stored — only SHA256 hash is stored in DB
const verificationToken = crypto.randomBytes(32).toString('hex');
const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
user.emailVerificationToken = tokenHash;
// Only verificationToken is sent via email
```

### 9.5 CORS Configuration

```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
```

---

## 10. Deployment & Environment Setup

### 10.1 Prerequisites

```
Node.js 18+ LTS
npm 9+
MongoDB 6+ (optional — app runs in sandbox mode without it)
```

### 10.2 Installation

```bash
# Clone the repository
git clone <repository-url>
cd e-commerce

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 10.3 Backend Environment Variables (`.env`)

```env
PORT=5050
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nexacart
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Razorpay (optional — leave blank for simulated payments)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Email (optional — mock emails are logged to console)
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

### 10.4 Running Locally

```bash
# Terminal 1: Start Backend
cd backend
npm run start          # Production
# OR
npm run dev            # Development (nodemon auto-reload)

# Terminal 2: Start Frontend
cd frontend
npm run dev            # Vite dev server with HMR

# Access application:
# Frontend: http://localhost:5173
# Backend API: http://localhost:5050/api
# Health Check: http://localhost:5050/health
```

### 10.5 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nexacart.com | password123 |
| Customer | user@nexacart.com | password123 |

### 10.6 Sample Coupon Codes

| Code | Type | Value |
|------|------|-------|
| GLASS3D | Percent | 15% off |
| WELCOME100 | Fixed | ₹100 off |

---

## 11. Sandbox Failover Mode

NexaCart implements a critical resilience feature: if MongoDB is unavailable, the application automatically falls back to **Sandbox Mode** using an in-memory data store.

### 11.1 How It Works

```javascript
// In config/db.js
const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);  // Fail fast — no query buffering
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 4000 });
    global.isDbConnected = true;
    console.log('MongoDB Connected');
  } catch (error) {
    global.isDbConnected = false;
    console.warn('[Failover] Server proceeding in Sandbox Mode');
  }
};
```

```javascript
// In every controller function (example pattern)
export const getProducts = async (req, res) => {
  if (!global.isDbConnected) {
    // Use in-memory data
    return res.json(memoryProducts.filter(...));
  }
  // Use MongoDB
  const products = await Product.find(query);
  res.json(products);
};
```

### 11.2 In-Memory Data (`config/memoryStore.js`)

Pre-seeded sandbox data includes:
- **5 products** across 4 categories (Electronics, Accessories, Apparel, Home)
- **4 categories** (Electronics, Apparel, Accessories, Home)
- **5 brands** (AeroSound, AuraGlow, Chronos, Titan, EcoVibe)
- **2 coupons** (GLASS3D 15%, WELCOME100 ₹100)
- **2 users** (1 admin, 1 customer) with pre-set credentials

### 11.3 Sandbox Limitations

| Feature | Full MongoDB | Sandbox Mode |
|---------|-------------|--------------|
| Data persistence across restarts | ✅ | ❌ (resets on server restart) |
| Password hashing (bcrypt) | ✅ | ❌ (plain text comparison) |
| Email verification emails | ✅ (Nodemailer) | ✅ (auto-verified) |
| Google OAuth | ✅ | ❌ (returns 501) |
| All CRUD operations | ✅ | ✅ (in-memory) |
| Real-time Socket.IO events | ✅ | ✅ |

### 11.4 Console Output in Sandbox Mode

```
Server running in development mode on port 5050
Database Connection Error: connect ECONNREFUSED 127.0.0.1:27017
[Failover] Server proceeding in Sandbox Mode using local memory arrays.
[Failover] Skipping database seeding in Sandbox Mode.
```

---

## 12. Viva Q&A – 25 Questions

---

**Q1. What is the MERN stack and why did you choose it for this project?**

MERN stands for **MongoDB, Express.js, React.js, and Node.js**. This combination was chosen because all components use JavaScript, enabling full-stack development in a single language — reducing context switching and enabling code sharing (e.g., validation logic). MongoDB's flexible schema handles product variants cleanly; Express.js provides a minimal, high-performance API framework; React's component model suits complex UIs like multi-step checkout; Node's non-blocking I/O handles concurrent API calls efficiently.

---

**Q2. How does JWT authentication work in NexaCart?**

On successful login, the server generates a JWT using `jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' })`. The token is returned to the client and stored in `localStorage`. For protected routes, the client sends the token in the `Authorization: Bearer <token>` header. The `protect` middleware decodes it using `jwt.verify()`, fetches the user from DB by the embedded ID, and attaches it to `req.user`. If the token is expired, tampered with, or missing, the middleware returns a 401 error immediately.

---

**Q3. What is bcrypt and why use 10 rounds for password hashing?**

bcrypt is a password hashing function designed to be computationally slow — making brute-force attacks impractical. The "rounds" parameter (cost factor) defines how many times the hashing computation is performed (2^10 = 1024 iterations). At 10 rounds, hashing takes ~100ms on modern hardware — imperceptible to users but means an attacker can test only ~10 passwords per second rather than millions. Higher rounds provide more security but slower performance; 10 is the industry-recommended balance.

---

**Q4. How does the Razorpay integration work and what is HMAC signature verification?**

The flow: frontend requests order creation → backend creates a Razorpay order via SDK → frontend receives `order_id` and opens the Razorpay popup. After payment, Razorpay returns `payment_id`, `order_id`, and `signature`. The backend verifies the signature by computing `HMAC-SHA256(order_id + '|' + payment_id, key_secret)` and comparing it with the received signature. If they match, the payment is authentic — this prevents replay attacks and payment forgery, as only the holder of `key_secret` can generate a valid signature.

---

**Q5. Explain the Socket.IO real-time inventory feature.**

Socket.IO establishes a persistent WebSocket connection between the browser and the server. When any order is placed, the `orderController` decrements `product.inventoryCount` and calls `io.emit('inventoryUpdate', { productId, inventoryCount })`. All connected browser clients receive this event. The AppContext listener updates the affected cart item's product data in real-time. If inventory drops below 5, an `inventoryLow` event triggers a warning toast. If it hits 0, `inventoryOutOfStock` removes the item from all carts. This prevents overselling.

---

**Q6. What is the purpose of the in-memory sandbox failover?**

The sandbox failover ensures the application remains fully demonstrable even when MongoDB is offline (e.g., during a project demo or assessment). Rather than crashing or showing blank screens, the server detects the connection failure (4-second timeout), sets `global.isDbConnected = false`, and every controller checks this flag. If false, it uses in-memory JavaScript arrays pre-populated with realistic data. All features — auth, cart, orders, analytics — work identically in sandbox mode.

---

**Q7. What is Redux Toolkit and when is it used instead of React Context?**

Redux Toolkit is used for global client-side state where: (1) multiple unrelated components need to read the same state, (2) state changes are frequent and need predictable history, or (3) DevTools time-travel debugging is valuable. In NexaCart, Redux manages `recentlyViewed` (cross-page product tracking) and `compareList` (product comparison basket). These states don't involve server data and persist across route changes. React Context is used for server-synchronized state (cart, user, auth) where a single provider with fetch logic is cleaner.

---

**Q8. How does the promo code/coupon engine work?**

When a user enters a coupon code at checkout: the frontend sends `POST /api/coupons/validate { code }`. The backend checks: (1) code exists and `isActive`, (2) `expiryDate > now`, (3) `usedCount < usageLimit`. If valid, it returns `{ discountType, discountValue }`. The frontend calculates: for `percent` type → `discountAmount = subtotal * value / 100`; for `fixed` type → `discountAmount = Math.min(subtotal, value)`. The `total = subtotal - discountAmount`. On successful order creation, `coupon.usedCount++` is incremented.

---

**Q9. Explain the product schema's specification field design.**

Product specifications use MongoDB's `Map` type (a flexible key-value store). Instead of predefined columns like `batteryLife`, `screenSize`, `material` (which would be sparse and null-filled for most products), each product can define its own spec keys. Headphones might have `{ driver: '40mm', battery: '40h' }` while keyboards have `{ switches: 'Linear', keycaps: 'PBT' }`. The frontend renders these dynamically as a table. This demonstrates understanding of schemaless design and polymorphic data modelling.

---

**Q10. Why are product details denormalized in the Order schema?**

Order items store `title`, `price`, and `image` as snapshots at the time of ordering — not just a `productId` reference. This is intentional: if a product is later deleted, renamed, or repriced, the customer's order history should still show exactly what they bought and for how much. This is called "point-in-time accuracy" or "temporal consistency." If we used only a reference, we'd need to join to the product collection, and historical accuracy would break if the product data changed.

---

**Q11. How is the glassmorphic UI design implemented technically?**

Glassmorphism uses CSS properties: `background: rgba(255,255,255,0.65)` (semi-transparent white), `backdrop-filter: blur(20px)` (frosted glass blur of content behind the element), `border: 1px solid rgba(255,255,255,0.5)` (translucent border), and `border-radius: 24px`. The `glass-card` class in `index.css` encapsulates these. The `-webkit-backdrop-filter` vendor prefix is included for Safari compatibility. The effect creates visual hierarchy without heavy shadows — the background content shows through subtly.

---

**Q12. What is Vite and how does it differ from Create React App (CRA)?**

Vite is a next-generation frontend build tool that uses **native ES modules** in development (no bundling step), serving files on-demand. CRA bundles everything with Webpack. This makes Vite's dev server start in milliseconds (vs. 10-30 seconds for CRA on large apps) and enables near-instant Hot Module Replacement (HMR). For production, Vite bundles with Rollup, which produces more optimized output than Webpack in many cases. Vite also has first-class support for TypeScript, JSX, and CSS modules without configuration.

---

**Q13. How does the email verification system work?**

On registration: a `crypto.randomBytes(32)` raw token is generated. Its SHA256 hash is stored in `User.emailVerificationToken`. The raw token is included in a verification URL sent via email. The email link hits `GET /verify-email/:token`. The backend hashes the URL token with SHA256 and queries for a user with matching hash and non-expired `emailVerificationExpires`. If found, it sets `isEmailVerified = true` and clears the token fields. Storing only the hash means even database breach doesn't leak valid tokens.

---

**Q14. How does the loyalty points and wallet system incentivize purchases?**

**Acquisition**: New users receive ₹100 wallet credit automatically. Referral codes give the referrer ₹50 and the new user gets ₹150 instead. **Retention**: Every order earns loyalty points at 10% of order value (₹300 order → 30 points). **Redemption**: Wallet balance can be applied at checkout to reduce the payment amount. This creates a closed-loop economy: buying generates points, points reduce future purchases, which encourages repeat orders — the same model used by Amazon Pay and Flipkart SuperCoins.

---

**Q15. What MongoDB aggregation pipeline stages did you use for analytics?**

The admin analytics uses three aggregate queries:
1. **Revenue total**: `$match (paid)` → `$group (null, sum totalAmount)`
2. **Daily revenue**: `$match (paid, last 7 days)` → `$group by formatted date` → `$sort by date ascending`
3. **Top products**: `$match (paid)` → `$unwind items array` → `$group by productId (sum quantity)` → `$sort descending` → `$limit 5`

The `$unwind` stage is key — it deconstructs the `items` array so each order item becomes a separate document, enabling per-product aggregation.

---

**Q16. What is the role of middleware in Express.js?**

Middleware functions are functions that have access to `req`, `res`, and `next`. They execute sequentially in the order registered. NexaCart uses:
- `express.json()` — parses JSON request bodies
- `cors()` — sets CORS headers based on allowed origins
- `protect` — JWT verification (applied per-route)
- `adminOnly` — role check (applied after `protect`)
- Global error handler — last-registered middleware catches unhandled errors

The middleware chain allows cross-cutting concerns (auth, logging, validation) to be applied without duplicating code in every controller.

---

**Q17. How does Recharts work and what chart types did you use?**

Recharts is a React charting library using SVG. Charts are composed declaratively with nested React components. NexaCart uses:
- **AreaChart**: 7-day daily revenue — `XAxis` (date labels), `YAxis` (₹ values), `Area` (gradient fill), `Tooltip` (hover data)
- **BarChart**: Top 5 selling products — horizontal bars with product name labels
- **Responsive containers**: `<ResponsiveContainer width="100%" height={300}>` wraps all charts for adaptive sizing

Data is passed via the `data` prop as arrays of objects. This is more maintainable than Canvas-based libraries like Chart.js because charts are part of the React component tree.

---

**Q18. What is the purpose of React Router's URL-driven filter state?**

In NexaCart, clicking a category on the Home page navigates to `/shop?category=Electronics`. The Shop component reads `useSearchParams()` on mount to initialize `filters.category = 'Electronics'`. This ensures: (1) users can share or bookmark filtered views, (2) browser back button restores the previous filter state, (3) direct URL access lands on the correct filtered page. Without URL-driven state, filter state would be lost on refresh or link sharing — a common UX failure in SPAs.

---

**Q19. How is WebSocket different from HTTP and when do you use each?**

HTTP is a request-response protocol — the client must initiate every communication. WebSockets establish a persistent, bidirectional connection after an initial HTTP upgrade handshake. After upgrade, either party can push data any time without a request. NexaCart uses HTTP for CRUD operations (standard REST API calls) where the client needs specific data on demand. WebSockets (via Socket.IO) are used for inventory updates and chat — events the server must push to clients immediately without the client polling.

---

**Q20. Explain the React Context API pattern used in AppContext.**

AppContext wraps the entire application and provides a single source of truth for server-synchronized state. `createContext()` creates the context object. `AppProvider` is a component that owns all state with `useState`/`useEffect` hooks, defines all business logic functions, and wraps children in `AppContext.Provider` with the value object. `useApp()` is a custom hook using `useContext(AppContext)` for clean consumption. This pattern avoids "prop drilling" (passing props through many intermediate components) and co-locates related state and logic.

---

**Q21. What is Framer Motion and how are animations implemented?**

Framer Motion is a production-ready React animation library using a declarative approach. Animations are defined as component props (`initial`, `animate`, `exit`, `transition`, `whileHover`). NexaCart uses it for:
- Page entry animations (`initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`)
- Modal open/close transitions (`AnimatePresence` wraps conditional renders)
- Card hover interactions (`whileHover={{ scale: 1.02 }}`)
- Staggered list animations (using `variants` with `staggerChildren`)

Unlike CSS animations, Framer Motion animations are gesture-aware, interruptible, and can use physics-based spring simulations.

---

**Q22. How does the product comparison feature work technically?**

Products are added to Redux `compareList` slice from any `ProductCard` via `dispatch(addToCompare(product))`. The `ProductCompare` component reads this slice. To build the comparison table: (1) Collect all products in `compareList`, (2) Extract all unique spec keys using a Set across all product `specifications` objects, (3) Render a table where columns are products and rows are spec keys, (4) For each cell, look up `product.specifications[key] || '—'`. Cells where all values differ are highlighted. Maximum 4 products enforced in the slice reducer.

---

**Q23. What would happen if we used `bufferCommands: false` without sandbox failover?**

Without the failover, `bufferCommands: false` means every Mongoose operation would throw `Cannot call x.countDocuments() before initial connection` when MongoDB is offline. The server would crash or return 500 errors for every API request. The sandbox failover intercepts these scenarios: by checking `global.isDbConnected` before any Mongoose call and routing to in-memory operations instead, the API continues functioning. This demonstrates understanding of fault-tolerant system design and graceful degradation — a key principle in production engineering.

---

**Q24. How does the voice search feature work and what are its limitations?**

Voice search uses the browser's **Web Speech API** (`window.SpeechRecognition` or `window.webkitSpeechRecognition`). When the mic icon is clicked, `recognition.start()` begins listening. The `onresult` event fires with recognized text, which is used to populate the search input and trigger a product API call. **Limitations**: (1) Browser support is primarily Chrome/Edge — Firefox and Safari have limited support, (2) Requires HTTPS in production (microphone access is blocked on HTTP), (3) Accuracy depends on microphone quality and ambient noise, (4) Only English (`lang: 'en-US'`) is configured — multilingual search would need additional setup.

---

**Q25. What are the main areas you would improve for true production deployment?**

1. **HTTPS / TLS**: Configure SSL certificate (Let's Encrypt) — required for Razorpay live keys, voice search, and secure cookie sessions
2. **Rate Limiting**: Add `express-rate-limit` middleware to prevent API abuse and DDoS
3. **Input Sanitization**: Add `express-validator` or `joi` for strict schema validation of all request bodies
4. **Image Upload**: Replace URL-based images with actual file upload (Cloudinary/AWS S3) using `multer` middleware
5. **Redis Session / Caching**: Cache product listings and analytics in Redis to reduce MongoDB load
6. **MongoDB Atlas**: Move from local MongoDB to cloud-hosted Atlas with replica sets for availability
7. **CI/CD Pipeline**: GitHub Actions to run tests, lint, build, and deploy on push
8. **Comprehensive Testing**: Jest + React Testing Library for unit tests; Cypress for E2E flow testing
9. **Logging**: Replace `console.log` with Winston or Pino structured logging
10. **Environment-specific Config**: Use separate `.env.development`, `.env.production`, `.env.test` with a config validation library like `zod`

---

*Documentation compiled for NexaCart – Final Year CSE Project 2025*
*Technology: MERN Stack | Real-Time: Socket.IO | Payments: Razorpay | UI: Glassmorphic Light Mode*
