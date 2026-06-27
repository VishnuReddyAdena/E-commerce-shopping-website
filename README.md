# E-Commerce Shopping Website

A modern, full-featured e-commerce platform built with cutting-edge web technologies. This application provides a seamless shopping experience with a robust backend API and an intuitive user interface.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Payment Integration](#payment-integration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Features

### Core Features
- **Product Catalog**: Browse and search products with advanced filtering options
- **Shopping Cart**: Add, update, and remove items from cart
- **User Authentication**: Secure login and registration system
- **Order Management**: View order history and track orders
- **Wishlist**: Save favorite products for later
- **Product Reviews**: Leave ratings and reviews on products
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Admin Features
- **Dashboard**: Comprehensive admin panel with analytics
- **Product Management**: Add, edit, and delete products
- **Order Management**: View and manage customer orders
- **User Management**: Manage customer accounts and roles
- **Inventory Tracking**: Monitor stock levels
- **Reports**: Generate sales and analytics reports

### Payment & Checkout
- **Secure Checkout**: PCI-compliant payment processing
- **Multiple Payment Methods**: Credit/Debit cards, PayPal, Wallet
- **Discount Codes**: Apply promotional codes and coupons
- **Shipping Options**: Multiple delivery methods and cost calculation

## Tech Stack

### Frontend
- **React.js** - UI library
- **Redux** - State management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation
- **Stripe.js** - Payment integration

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### DevOps & Tools
- **Docker** - Containerization
- **Git** - Version control
- **Jest** - Testing framework
- **Postman** - API testing

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v16.0 or higher
- **npm** v7.0 or higher (or yarn v1.22+)
- **MongoDB** v4.4 or higher (local or Atlas)
- **Git** v2.0 or higher
- **Docker** (optional, for containerized deployment)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VishnuReddyAdena/E-commerce-shopping-website.git
   cd E-commerce-shopping-website
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Payment Gateway
STRIPE_API_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key

# Cloudinary (Image Upload)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## Running the Application

### Development Mode

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The API will be available at `http://localhost:5000`

3. **Start the frontend development server** (in another terminal)
   ```bash
   cd frontend
   npm start
   ```
   The application will open at `http://localhost:3000`

### Production Build

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the production server**
   ```bash
   cd backend
   npm run start
   ```

### Using Docker

```bash
# Build the Docker image
docker-compose build

# Run the application
docker-compose up -d

# View logs
docker-compose logs -f
```

## Project Structure

```
E-commerce-shopping-website/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── userController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── users.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── validators.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── ProductCard.js
│   │   │   └── Cart.js
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   ├── ProductPage.js
│   │   │   ├── CartPage.js
│   │   │   └── CheckoutPage.js
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   ├── slices/
│   │   │   │   ├── cartSlice.js
│   │   │   │   └── authSlice.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.js
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile

### Product Endpoints
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product (admin only)
- `PUT /products/:id` - Update product (admin only)
- `DELETE /products/:id` - Delete product (admin only)

### Order Endpoints
- `POST /orders` - Create order
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order by ID
- `PUT /orders/:id` - Update order status (admin only)

For detailed API documentation, refer to the [API_DOCS.md](./API_DOCS.md) file.

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  address: String,
  role: String (user/admin),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  stock: Number,
  rating: Number,
  reviews: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  user: ObjectId,
  products: [{
    productId: ObjectId,
    quantity: Number,
    price: Number
  }],
  totalPrice: Number,
  status: String,
  deliveryAddress: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication

The application uses JWT (JSON Web Tokens) for authentication. Tokens are issued upon login and must be included in the `Authorization` header for protected routes.

```bash
Authorization: Bearer <token>
```

## Payment Integration

This application uses **Stripe** for secure payment processing. Ensure you have:
1. A Stripe account
2. API keys configured in `.env`
3. Stripe webhook configured for order confirmation

## Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ../frontend
npm test

# Coverage report
npm run test:coverage
```

### Test Files Location
- Backend: `backend/tests/`
- Frontend: `frontend/src/__tests__/`

## Deployment

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_ATLAS_URI=your_mongodb_uri

# Deploy
git push heroku main
```

### Deploy to AWS/Docker

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Support

For support, email us at support@ecommerce.com or open an issue in the GitHub repository.

### Useful Resources
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Stripe Documentation](https://stripe.com/docs)

---

**Happy Shopping! 🛍️**

Made with ❤️ by the E-Commerce Team
