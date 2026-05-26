# Online Clothes Thrifting System - Backend API

> A robust, scalable Node.js/Express backend API for the Online Clothes Thrifting System. Handles authentication, product management, order processing, and secure payment integration.

[![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](#prerequisites)
[![Express Version](https://img.shields.io/badge/express-4.18.3+-blue)](#tech-stack)
[![MongoDB](https://img.shields.io/badge/database-MongoDB-green)](#tech-stack)
[![License](https://img.shields.io/badge/license-MIT-blue)](#license)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Security](#security)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Support](#support)
- [License](#license)

## 🎯 Overview

The Online Clothes Thrifting System Backend is a comprehensive REST API built with Node.js and Express. It provides secure endpoints for user authentication, product management, order processing, and payment handling with eSewa integration. The API is designed following RESTful principles with JWT-based authentication and MongoDB for data persistence.

## ✨ Features

### Core Features
- 🔐 **JWT-based Authentication** - Secure token-based authentication with refresh tokens
- 👥 **User Management** - Role-based access control (Buyers, Sellers, Admins)
- 👗 **Product Management** - Full CRUD operations for clothing inventory
- 🛒 **Order Processing** - Complete order lifecycle from creation to delivery
- 💳 **Payment Integration** - eSewa payment gateway for secure transactions
- 📤 **File Upload** - Multer-based image upload and storage
- 🔄 **Real-time Updates** - Order status tracking and notifications
- 📊 **Analytics** - Sales and user engagement metrics
- 🛡️ **Security** - Password hashing, input validation, CORS protection
- ⚠️ **Error Handling** - Comprehensive error handling and logging
- 📝 **API Documentation** - Complete endpoint documentation

### Security Features
- **Password Hashing**: Bcryptjs for secure password storage
- **JWT Tokens**: Stateless authentication with token expiration
- **CORS**: Configured for authorized domain access
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **Environment Variables**: Sensitive data protection
- **SQL Injection Prevention**: Mongoose schema validation

## 🛠️ Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Runtime** | Node.js | 16+ |
| **Framework** | Express.js | 4.18.3+ |
| **Database** | MongoDB | Latest |
| **ODM** | Mongoose | 8.2.1+ |
| **Authentication** | JWT (jsonwebtoken) | Latest |
| **Password Hashing** | Bcryptjs | Latest |
| **File Upload** | Multer | 1.4.5+ |
| **CORS** | cors | Latest |
| **Environment** | dotenv | Latest |
| **Logging** | Morgan | Latest |
| **Development** | Nodemon | Latest |

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **npm** v7+ or **yarn** v1.22+ package manager
- **MongoDB** ([Local](https://docs.mongodb.com/manual/installation/) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** for version control
- **eSewa Account** for payment integration ([Register](https://esewa.com.np/))
- **Postman** or **Insomnia** for API testing (Optional)

Verify installation:
```bash
node --version
npm --version
git --version
mongo --version  # if using local MongoDB
```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Madhav9876/OnlineClothesThriftingSystem-Backend.git
cd OnlineClothesThriftingSystem-Backend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory with the following configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
# For local MongoDB:
# MONGO_URI=mongodb://localhost:27017/thrifting-system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRE=30d

# File Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_PATH=./uploads

# eSewa Payment Configuration
ESEWA_TEST_IDS=9806800001,9806800002,9806800003,9806800004,9806800005
ESEWA_TEST_PASSWORD=Nepal@123
ESEWA_TEST_MPIN=1122
ESEWA_TEST_MERCHANT_ID=EPAYTEST
ESEWA_TEST_TOKEN=123456
ESEWA_EPAY_V2_SECRET_KEY=your-esewa-secret-key
ESEWA_SDK_CLIENT_ID=your-esewa-client-id
ESEWA_SDK_CLIENT_SECRET=your-esewa-client-secret

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Logging
LOG_LEVEL=debug
LOG_FORMAT=combined
```

### Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | development/production |
| `PORT` | Server port | 3000 |
| `MONGO_URI` | Database connection string | mongodb+srv://... |
| `JWT_SECRET` | Secret key for JWT signing | random-string |
| `ESEWA_*` | eSewa payment credentials | From eSewa merchant account |
| `ALLOWED_ORIGINS` | CORS allowed domains | Domain URLs |

## 🎮 Running the Server

### Development Mode (with Auto-reload)

```bash
npm run dev
```

The server will start at `http://localhost:3000` and automatically reload on file changes.

### Production Mode

```bash
npm start
```

### Run Specific Script

```bash
# Test endpoints
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## 📁 Project Structure

```
OnlineClothesThriftingSystem-Backend/
├── src/
│   ├── models/                  # Mongoose schemas and models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Payment.js
│   │   └── Review.js
│   ├── routes/                  # API route definitions
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── userRoutes.js
│   ├── controllers/             # Request handlers and business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   └── userController.js
│   ├── middleware/              # Custom middleware
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── upload.js
│   ├── config/                  # Configuration files
│   │   ├── database.js
│   │   └── constants.js
│   ├── utils/                   # Utility functions
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── logger.js
│   ├── server.js                # Express app setup
│   └── main.js                  # Application entry point
├── .env                         # Environment variables
├── .env.example                 # Example environment file
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 📚 API Documentation

### Base URL

```
Development: http://localhost:3000
Production: https://your-api-domain.com
```

### Authentication Headers

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "buyer"  // or "seller"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  }
}
```

#### Logout User
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Get Current User Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?page=1&limit=10&category=shirts&sort=newest
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `sort` - Sort by: newest, popular, priceAsc, priceDesc

**Response (200):**
```json
{
  "success": true,
  "total": 150,
  "page": 1,
  "pages": 15,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Vintage Blue Jeans",
      "description": "Classic denim jeans...",
      "price": 25.99,
      "category": "pants",
      "size": ["S", "M", "L"],
      "condition": "like-new",
      "seller": "507f1f77bcf86cd799439011",
      "images": ["url1", "url2"],
      "createdAt": "2026-05-26T10:00:00Z"
    }
  ]
}
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Create New Product (Seller Only)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- title: "Vintage Blue Jeans"
- description: "Classic denim jeans"
- price: 25.99
- category: "pants"
- sizes: ["S", "M", "L"]
- condition: "like-new"
- images: [file1, file2, file3]
```

#### Update Product
```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 29.99
}
```

#### Delete Product
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

### Order Endpoints

#### Get User Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 2,
      "size": "M"
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Kathmandu",
    "state": "Kathmandu",
    "zipCode": "44600",
    "country": "Nepal"
  }
}
```

#### Get Order Details
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Update Order Status (Seller/Admin Only)
```http
PUT /api/orders/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shipped"  // pending, confirmed, shipped, delivered, cancelled
}
```

#### Cancel Order
```http
DELETE /api/orders/:id
Authorization: Bearer <token>
```

### Payment Endpoints

#### Initiate eSewa Payment
```http
POST /api/payments/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439013",
  "amount": 1500,
  "productName": "Vintage Blue Jeans"
}
```

#### Payment Callback (eSewa Webhook)
```http
POST /api/payments/callback
Content-Type: application/x-www-form-urlencoded

esewa_request_id=17241...
order_id=507f1f77bcf86cd799439013
transaction_code=0015U...
status=COMPLETE
```

#### Check Payment Status
```http
GET /api/payments/status/:id
Authorization: Bearer <token>
```

### User Endpoints

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+977-9841234567",
  "address": {
    "street": "123 Main St",
    "city": "Kathmandu"
  }
}
```

#### Change Password
```http
PUT /api/users/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "currentPassword",
  "newPassword": "newPassword123"
}
```

#### Delete Account
```http
DELETE /api/users/profile
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### User Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String (buyer/seller/admin),
  avatar: String (image URL),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  price: Number,
  category: String,
  sizes: [String],
  condition: String (like-new/good/fair/worn),
  seller: ObjectId (reference to User),
  images: [String],
  stock: Number,
  ratings: Number,
  reviews: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique),
  buyer: ObjectId (reference to User),
  items: [{
    productId: ObjectId,
    quantity: Number,
    size: String,
    price: Number
  }],
  totalAmount: Number,
  status: String (pending/confirmed/shipped/delivered/cancelled),
  paymentStatus: String (pending/completed/failed),
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  trackingNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Schema
```javascript
{
  _id: ObjectId,
  orderId: ObjectId (reference to Order),
  amount: Number,
  currency: String (NPR/USD),
  provider: String (esewa/stripe),
  transactionId: String,
  status: String (pending/completed/failed/refunded),
  paymentMethod: String,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### How It Works

1. **Registration**: User creates account → password hashed with bcryptjs → JWT token issued
2. **Login**: User provides credentials → password verified → JWT token issued
3. **Protected Requests**: Include token in Authorization header
4. **Token Validation**: Middleware validates token → request processed

### Token Structure

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTYyNTAwMDAwMH0.signature
```

### Refresh Token Flow

```
1. Access token expires
2. Client sends refresh token
3. Server validates and issues new access token
4. Continue with new token
```

## ⚠️ Error Handling

All errors are returned in a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Bad Request | Check request format and parameters |
| 401 | Unauthorized | Provide valid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Email already registered |
| 422 | Unprocessable Entity | Validation errors |
| 500 | Server Error | Contact support |

## 🛡️ Security

### Best Practices Implemented

✅ **Password Security**
- Bcryptjs hashing with salt rounds
- Minimum 8 characters required
- Special characters recommended

✅ **JWT Security**
- Secret key encryption
- Token expiration (7 days)
- Refresh token implementation
- No sensitive data in tokens

✅ **API Security**
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

✅ **Data Protection**
- HTTPS recommended for production
- Environment variables for secrets
- Secure database connections
- Regular backups

### Security Checklist for Production

- [ ] Change JWT_SECRET to strong random key
- [ ] Enable HTTPS
- [ ] Configure ALLOWED_ORIGINS correctly
- [ ] Set NODE_ENV=production
- [ ] Enable rate limiting
- [ ] Setup logging and monitoring
- [ ] Regular security audits
- [ ] Database backups enabled
- [ ] API keys rotated periodically

## 🚀 Deployment

### Prepare for Deployment

```bash
# Ensure all environment variables are set
# Test thoroughly in staging environment
# Build and minify assets if needed
npm run build
```

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production JWT_SECRET=xxx

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Deploy to Railway

1. Push to GitHub
2. Connect Railway to GitHub
3. Set environment variables in Railway dashboard
4. Railway auto-deploys on push

### Deploy to Render

1. Create Render account
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

### Deploy to AWS

1. Create EC2 instance
2. SSH into instance
3. Install Node.js and MongoDB (or use RDS)
4. Clone repository
5. Install dependencies: `npm install`
6. Set environment variables
7. Start server: `npm start`
8. Use PM2 for process management

### Deploy to Google Cloud / Azure

Similar to AWS, use their respective documentation and deployment guides.

## 🤝 Contributing

We welcome contributions! Here's how:

### Step-by-Step Guide

1. **Fork** the repository

2. **Clone** your fork
   ```bash
   git clone https://github.com/YOUR_USERNAME/OnlineClothesThriftingSystem-Backend.git
   cd OnlineClothesThriftingSystem-Backend
   ```

3. **Create** a feature branch
   ```bash
   git checkout -b feature/YourFeature
   ```

4. **Make** your changes
   - Follow Express/Node.js best practices
   - Add input validation
   - Include error handling
   - Add comments for complex logic

5. **Test** your changes
   ```bash
   npm test
   ```

6. **Commit** changes
   ```bash
   git commit -m 'Add: YourFeature description'
   ```

7. **Push** to your branch
   ```bash
   git push origin feature/YourFeature
   ```

8. **Open** a Pull Request
   - Describe changes clearly
   - Link related issues
   - Include any breaking changes

### Code Standards

- Use ES6+ syntax
- Follow RESTful API design
- Add JSDoc comments
- Include error handling
- Write meaningful commit messages
- One feature per PR

## 🐛 Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**
- Ensure MongoDB is running: `mongod` (local) or check Atlas connection string
- Verify `MONGO_URI` in `.env` file
- Check firewall and network settings
- For Atlas, whitelist your IP address

### JWT Token Errors

```
Error: jwt malformed
Error: jwt expired
```

**Solutions:**
- Verify token format in Authorization header: `Bearer <token>`
- Check JWT_SECRET is correct
- Ensure token hasn't expired
- Use refresh token if available

### File Upload Issues

```
Error: File too large
```

**Solutions:**
- Check MAX_FILE_SIZE in `.env`
- Compress images before uploading
- Increase file size limit if needed
- Ensure upload directory has write permissions

### Port Already in Use

```
Error: listen EADDRINUSE :::3000
```

**Solutions:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### CORS Errors

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solutions:**
- Verify frontend URL is in ALLOWED_ORIGINS
- Check CORS middleware is configured
- Ensure Content-Type headers are correct

## 📞 Support

### Get Help

- **GitHub Issues**: [Create an issue](https://github.com/Madhav9876/OnlineClothesThriftingSystem-Backend/issues)
- **Documentation**: Check the docs folder
- **Email**: Contact maintainer
- **GitHub Discussions**: Community support

### Bug Report Template

```
### Description
Clear description of the issue

### Steps to Reproduce
1. ...
2. ...
3. ...

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Environment
- OS: Windows/Mac/Linux
- Node version: v16.x
- npm version: v7.x
- Database: MongoDB

### Additional Context
Screenshots, error logs, etc.
```

## 🔗 Related Repositories

- **Frontend**: [OnlineClothesThriftingSystem-frontend](https://github.com/Madhav9876/OnlineClothesThriftingSystem-Frontend)
- **Mobile App**: (Coming Soon)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

You are free to:
- ✅ Use for commercial/personal projects
- ✅ Modify and distribute
- ✅ Include in your own projects

Please include the license notice in copies.

## 👤 Author

**Madhav Jain**
- GitHub: [@Madhav9876](https://github.com/Madhav9876)
- Portfolio: (Coming Soon)

## 🙏 Acknowledgments

- Express.js community
- MongoDB and Mongoose teams
- eSewa for payment integration
- Contributors and testers
- Users providing feedback

## 📊 API Statistics

- **Endpoints**: 25+
- **Database Models**: 5
- **Authentication**: JWT
- **File Upload**: Multer
- **Payment Gateway**: eSewa

---

<div align="center">

**Made with ❤️ for sustainable fashion**

[⬆ Back to Top](#online-clothes-thrifting-system---backend-api)

</div>
