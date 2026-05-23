# Backend Deployment Guide

## Overview
This is a Node.js Express backend for a full-stack portfolio application. It includes MongoDB integration, contact form handling, resume download tracking, and admin dashboard API.

## Prerequisites
- Node.js 20.x or higher
- MongoDB Atlas account
- SMTP email service (Gmail, SendGrid, etc.)
- Render account (or other hosting platform)

## Local Development Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:
```env
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-min-32-characters
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-strong-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Portfolio Contact <your-email@gmail.com>
```

### 3. Run Locally
```bash
# Development with auto-reload
npm run dev

# Production
NODE_ENV=production npm start
```

The server will start on `http://localhost:5000`

## MongoDB Atlas Setup

### 1. Create MongoDB Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account or sign in
3. Click "Create" to create a new cluster
4. Choose shared tier (free)
5. Select your preferred region
6. Click "Create Cluster"

### 2. Create Database User
1. In MongoDB Atlas, go to "Database Access"
2. Click "Add New Database User"
3. Enter username and password
4. Set privileges to "Read and write to any database"
5. Click "Add User"

### 3. Get Connection String
1. Go to "Clusters" → Your cluster → "Connect"
2. Click "Connect your application"
3. Copy the connection string
4. Replace `<username>` and `<password>` with your database user credentials
5. Replace `<database_name>` with your database name (e.g., "portfolio")
6. Use this as your `MONGO_URI`

### 4. Whitelist IP Addresses
1. Go to "Network Access"
2. Click "Add IP Address"
3. For Render: Click "Allow access from anywhere" (0.0.0.0/0) - for free tier only
4. For production: Add specific IP addresses instead

## API Endpoints

### Contact Form
- **POST** `/api/contact`
  - Body: `{ name, email, message }`
  - Saves inquiry to database and sends email notification

### Download Tracking
- **POST** `/api/download`
  - Body: `{ fileName }` (optional, defaults to resume)
  - Tracks file downloads

### Admin API
- **POST** `/api/admin/login`
  - Body: `{ email, password }`
  - Returns JWT token
  
- **GET** `/api/admin/stats` (requires auth)
  - Returns inquiry and download statistics
  
- **GET** `/api/admin/inquiries` (requires auth)
  - Returns list of inquiries
  
- **GET** `/api/admin/downloads` (requires auth)
  - Returns list of downloads

### Health Check
- **GET** `/api/health`
  - Returns: `{ status: 'ok', environment: 'production' }`

## Render Deployment

### 1. Prepare Repository
Ensure your project structure includes:
```
/backend
  /config
  /controllers
  /middleware
  /models
  /routes
  /utils
  .env.example
  package.json
  server.js
/frontend
  (or HTML files in root)
Procfile
render.yaml
```

### 2. Connect to Render
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository

### 3. Configure Service
- **Name:** portfolio-backend (or your choice)
- **Runtime:** Node
- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && npm start`
- **Plan:** Free tier available

### 4. Set Environment Variables
In the Render dashboard:
1. Go to your service
2. Click "Environment" tab
3. Add all variables from `.env.example`:
   - `NODE_ENV=production`
   - `MONGO_URI=your_mongodb_connection_string`
   - `JWT_SECRET=your_jwt_secret`
   - `ADMIN_EMAIL=your_admin_email`
   - `ADMIN_PASSWORD=your_admin_password`
   - Email configuration variables

### 5. Deploy
Click "Deploy" - Render will build and start your application

## Troubleshooting

### MongoDB Connection Failed

**Error: "MongoDB authentication failed"**
- Verify username and password in MONGO_URI are URL-encoded
- Check MongoDB Atlas network access whitelist includes your IP
- Ensure database user exists in MongoDB Atlas

**Error: "MONGO_URI not found"**
- Confirm `.env` file exists with `MONGO_URI` set
- On Render, check environment variables are configured
- Check for typos in variable names

### Render Deployment Failing

**Error: "Build failed"**
- Check build command includes `cd backend && npm install`
- Ensure `backend/package.json` exists
- Check Node.js version compatibility (need 20.x or higher)

**Error: "Cannot find module"**
- Run `npm install` locally and commit `package-lock.json`
- Verify all dependencies are listed in `package.json`

### Email Not Sending

**Error: "Email configuration incomplete"**
- Check all EMAIL_* variables are set
- For Gmail: Use app-specific password, not your regular password
- Enable "Less secure app access" for Gmail or use app password

### Frontend Files Not Found

**Error: "404 - Not Found"**
- Verify HTML files exist in root directory (`index.html`, `admin.html`)
- Check server logs for correct static file serving path
- Ensure frontend is built/compiled if using a build tool

## Production Checklist

- [ ] `.env` file created with all required variables
- [ ] MongoDB Atlas cluster created and accessible
- [ ] Database user created with correct permissions
- [ ] IP whitelist configured in MongoDB Atlas
- [ ] Email service configured and tested
- [ ] JWT_SECRET is a strong, random string
- [ ] ADMIN_PASSWORD is strong
- [ ] Node.js version set to 20.x
- [ ] All environment variables set in Render
- [ ] Procfile or render.yaml configured
- [ ] Health check endpoint responding
- [ ] Contact form endpoint tested
- [ ] Admin login endpoint tested
- [ ] Static files being served correctly
- [ ] Error logs checked for warnings

## Monitoring

Monitor your application using:
1. Render logs - Check for errors and startup messages
2. MongoDB Atlas monitoring - Monitor connection pool, database size
3. Health check endpoint - `curl https://your-app.onrender.com/api/health`

## Support

For issues:
1. Check server logs in Render dashboard
2. Verify all environment variables are set correctly
3. Test endpoints locally before deploying
4. Check MongoDB Atlas status page
5. Verify email service is working
