# REST API Backend System

A NodeJS/Express backend system with user management, role-based authentication, product management and more.

## Features

### 1. User Management
- User registration `/auth/signup`
- Login/Logout `/auth/login`, `/auth/logout` 
- Profile management `/auth/me`
- Password change `/auth/change_password`
- Password recovery `/auth/forgotpassword`
- Avatar upload `/auth/change_avatar`

### 2. Role-based Authorization
- User roles (user, mod, admin)
- API access control
- JWT authentication

### 3. Product Management
- CRUD operations `/products`
- Search by name and price range
- Category-based classification

### 4. Category Management
- CRUD operations `/categories`
- Auto-generated URL slugs
- Hierarchical categories

### 5. Menu Management
- Multi-level menus `/menus`
- Parent-child relationship support

### 6. CDN Server
- Separate media server for file uploads
- Runs on port 4000
- Image optimization

### 7. Additional Features
- Input validation
- Password encryption (bcrypt)
- JWT authentication
- Email sending (nodemailer)
- MongoDB integration
- CORS support

## Tech Stack
- Express.js
- MongoDB + Mongoose
- JWT
- Multer
- Express-validator

## Installation

```bash
# Install dependencies
npm install

# Start API server
npm start

# Start CDN server
cd cdn-server
npm start