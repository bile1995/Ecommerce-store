# MERN Ecommerce Backend

Backend API for the MERN Stack Ecommerce application with Auth0 authentication.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Auth0** - Authentication & Authorization
- **CORS** - Cross-origin resource sharing

## Features

- ✅ Auth0 JWT authentication
- ✅ Product management (CRUD)
- ✅ User profile management
- ✅ Shopping cart functionality
- ✅ Order processing
- ✅ Admin role-based access control
- ✅ Product search and filtering
- ✅ RESTful API design

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Auth0 account

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values with your configuration

3. Set up Auth0:
   - Create an Auth0 application
   - Create an Auth0 API
   - Update `.env` with your Auth0 credentials

## Environment Variables

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
CLIENT_URL=http://localhost:5173
```

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Products
- `GET /api/products` - Get all products (with pagination & filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured` - Get featured products
- `GET /api/products/categories` - Get all categories
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Users
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update user profile (Protected)
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)
- `PUT /api/users/:id/role` - Update user role (Admin)

### Cart
- `GET /api/cart` - Get user's cart (Protected)
- `POST /api/cart` - Add item to cart (Protected)
- `PUT /api/cart/:itemId` - Update cart item (Protected)
- `DELETE /api/cart/:itemId` - Remove item from cart (Protected)
- `DELETE /api/cart` - Clear cart (Protected)

### Orders
- `POST /api/orders` - Create order (Protected)
- `GET /api/orders/myorders` - Get user's orders (Protected)
- `GET /api/orders/:id` - Get order by ID (Protected)
- `PUT /api/orders/:id/pay` - Update order to paid (Protected)
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Health
- `GET /api/health` - Health check endpoint

## Project Structure

```
server/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── productController.js
│   ├── userController.js
│   ├── cartController.js
│   └── orderController.js
├── middleware/
│   └── auth.js            # Auth0 JWT middleware
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   └── Order.js
├── routes/
│   ├── productRoutes.js
│   ├── userRoutes.js
│   ├── cartRoutes.js
│   └── orderRoutes.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── server.js              # Entry point
```

## Auth0 Setup Guide

1. Create an Auth0 account at https://auth0.com
2. Create a new API in Auth0 Dashboard
3. Create a new Application (Single Page Application)
4. Configure the application settings
5. Add the Auth0 credentials to your `.env` file



