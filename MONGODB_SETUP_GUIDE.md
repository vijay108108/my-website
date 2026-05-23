# MongoDB Atlas & Render Deployment Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new project (e.g., "Portfolio")
4. Create a cluster (Free tier is fine)
   - Click "Create Deployment"
   - Select "Free" (M0)
   - Choose region closest to you
   - Click "Create Deployment"
5. Wait for cluster to deploy (5-10 minutes)

## Step 2: Get Your Connection String
1. In MongoDB Atlas, go to your cluster
2. Click **"Connect"**
3. Select **"Drivers"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 3: Create Database User
1. In MongoDB Atlas, go to **"Database Access"** (left menu)
2. Click **"Add New Database User"**
3. Create username and password
4. Note these credentials - you'll need them in the connection string
5. Click **"Add User"**

## Step 4: Whitelist Render IP
1. In MongoDB Atlas, go to **"Network Access"** (left menu)
2. Click **"Add IP Address"**
3. For development: Select **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

## Step 5: Update Your Connection String
1. Take the connection string from Step 2
2. Replace `username` with your database user from Step 3
3. Replace `password` with your database password from Step 3
4. Replace `/` at the end with `/portfolio` (or your database name)

Example:
```
mongodb+srv://john:mypassword123@cluster0.mongodb.net/portfolio?retryWrites=true&w=majority
```

⚠️ **If your password has special characters**, URL-encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `:` → `%3A`
- `?` → `%3F`

Use [urlencoder.org](https://www.urlencoder.org/) if needed.

## Step 6: Update Local `.env` File
1. Open `backend/.env` in your editor
2. Replace the `MONGO_URI` value with your connection string:
   ```
   MONGO_URI=mongodb+srv://john:mypassword123@cluster0.mongodb.net/portfolio?retryWrites=true&w=majority
   ```
3. Save the file

## Step 7: Test Locally
1. Open terminal in your project root
2. Run:
   ```bash
   cd backend
   npm install
   npm start
   ```
3. Look for this success message:
   ```
   ✓ MongoDB connected successfully
   ✓ Database: portfolio
   ✓ Host: cluster0.mongodb.net
   ```

If you get an error, check:
- ✓ Connection string is correct
- ✓ Username and password are correct
- ✓ Special characters are URL-encoded
- ✓ Network access is whitelisted in MongoDB Atlas

## Step 8: Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your **portfolio-backend** service
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add these variables:
   ```
   Key: MONGO_URI
   Value: mongodb+srv://john:mypassword123@cluster0.mongodb.net/portfolio?retryWrites=true&w=majority
   ```
   ```
   Key: NODE_ENV
   Value: production
   ```
6. Click **"Save"**
7. Go back to **"Deploy"** tab
8. Click **"Manual Deploy"** or **"Redeploy Latest Commit"**
9. Watch the logs - you should see:
   ```
   ✓ MongoDB connected successfully
   ```

## Troubleshooting

### Error: "bad auth : authentication failed"
- ✗ Check MongoDB username and password in connection string
- ✗ Check special characters are URL-encoded
- ✗ Verify database user exists in MongoDB Atlas → Database Access

### Error: "Connection timeout"
- ✗ Check IP is whitelisted in MongoDB Atlas → Network Access
- ✗ Try setting to 0.0.0.0/0 temporarily for testing

### Error: "MONGO_URI not found"
- ✗ Check environment variable is set in Render dashboard
- ✗ NOT in .env file - must be in Render Environment tab

## Next Steps
Once MongoDB is working:
1. Test contact form at `/api/contact`
2. Test admin login at `/admin`
3. Test resume download at `/api/download`
