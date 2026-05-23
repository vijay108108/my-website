# 🚨 MongoDB Authentication Failed - Fix Guide

## Error You're Getting
```
MongoDB connection failed: bad auth : authentication failed
```

## Root Causes (Check These First)

### ❌ Issue 1: MONGO_URI Not Set or Wrong Format
**Check:** Go to Render dashboard → Your service → Environment tab
- Does MONGO_URI exist?
- Does it start with `mongodb+srv://`?
- Does it contain `username:password@`?

**Fix:**
```
✓ Correct format:
mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority

❌ Wrong formats:
mongodb://username:password@localhost:27017/portfolio  (local connection)
mongodb+srv://username:password@cluster.mongodb.net  (missing database name)
```

---

### ❌ Issue 2: Special Characters Not URL-Encoded

If your password contains special characters like `@`, `#`, `$`, `%`, `/`, `:`, they must be URL-encoded!

**Example:**
- Original password: `MyPass@123#Safe`
- URL-encoded: `MyPass%40123%23Safe`

**Common Special Characters to Encode:**
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `/` → `%2F`
- `:` → `%3A`
- `?` → `%3F`

**Fix:** Use online URL encoder or Python:
```python
import urllib.parse
password = "MyPass@123#Safe"
encoded = urllib.parse.quote(password, safe='')
print(encoded)  # MyPass%40123%23Safe
```

Then use in MONGO_URI:
```
mongodb+srv://username:MyPass%40123%23Safe@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
```

---

### ❌ Issue 3: IP Address Not Whitelisted in MongoDB Atlas

**Step 1:** Go to https://cloud.mongodb.com
1. Select your cluster
2. Click "Network Access" (left sidebar)
3. Click "Add IP Address"

**Step 2:** Add Render's IP
- For development: `0.0.0.0/0` (allow all - less secure but easier)
- For production: Add Render's specific IP (if available)

**Step 3:** Verify
- Should see your IP in the list
- Status should be "Active"

---

### ❌ Issue 4: Username/Password Mismatch

**Step 1:** Verify in MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Select your cluster
3. Click "Database Access" (left sidebar)
4. Find your database user
5. Verify username matches what's in MONGO_URI

**Step 2:** Note the password
- Can't recover old password
- Must create new user if password forgotten

**Step 3:** Update MONGO_URI with correct credentials

---

### ❌ Issue 5: Cluster Name Wrong or Cluster Deleted

**Step 1:** Get correct cluster name
1. Go to https://cloud.mongodb.com → Clusters
2. Your cluster name should be in the URL
3. Example: `cluster0`, `cluster1`, etc.

**Step 2:** In MONGO_URI, between `@` and `.mongodb.net`:
```
mongodb+srv://username:password@CLUSTER_NAME.mongodb.net/portfolio
                                    ^^^^^^^^^^^
                                This must match exactly
```

---

## How to Get Correct MONGO_URI

### Step 1: Open MongoDB Atlas
Go to https://cloud.mongodb.com and login

### Step 2: Select Your Cluster
1. Click on "Clusters"
2. Click "Connect" button on your cluster

### Step 3: Choose "Connect your application"
1. Select "Node.js"
2. Version: 4.x or later
3. Copy the connection string

### Step 4: Modify Connection String
The string looks like:
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
```

Replace:
- `<username>` with your database username (NOT Atlas account username)
- `<password>` with your database password (URL-encoded if special chars)
- Add database name before `?`: `/portfolio?retryWrites=true&w=majority`

### Step 5: Result Should Look Like
```
mongodb+srv://myuser:mypass@cluster0.mongodb.net/portfolio?retryWrites=true&w=majority
```

---

## Testing MONGO_URI Locally

Before deploying to Render, test locally:

### 1. Create `.env` file in backend folder
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
```

### 2. Test connection
```bash
cd backend
npm install
npm start
```

### 3. Check logs for success
Look for:
```
✓ MongoDB connected successfully
✓ Database: portfolio
✓ Host: cluster0.mongodb.net
```

If you see "bad auth", the credentials are wrong.

---

## Render Deployment Steps

### 1. Set Environment Variable
1. Go to https://render.com
2. Select your service
3. Go to "Environment" tab
4. Click "Add Environment Variable"

**Name:** `MONGO_URI`
**Value:** Your corrected connection string (with URL-encoded password)

Example:
```
mongodb+srv://myuser:MyPass%40123@cluster0.mongodb.net/portfolio?retryWrites=true&w=majority
```

### 2. Check Other Variables
Make sure these are ALSO set:
- `NODE_ENV=production`
- `JWT_SECRET=your-strong-secret`
- `ADMIN_EMAIL=admin@example.com`
- `ADMIN_PASSWORD=your-password`
- Email variables (if using contact form)

### 3. Deploy
1. Click "Deploy" button
2. Wait for build to complete
3. Check logs for MongoDB connection success

---

## Troubleshooting Steps (In Order)

### Step 1: Verify Format
```bash
# Your MONGO_URI should:
✓ Start with mongodb+srv://
✓ Have username:password@
✓ Have cluster name
✓ Have /portfolio or /database_name
✓ Have ?retryWrites=true&w=majority
✓ Have NO spaces
```

### Step 2: URL-Encode Password
```bash
# If password has special chars (@#$%/:), URL-encode them
Original: pass@word
Encoded: pass%40word

# Use in MONGO_URI like:
mongodb+srv://user:pass%40word@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
```

### Step 3: Check IP Whitelist
1. MongoDB Atlas → Network Access
2. Verify `0.0.0.0/0` OR Render IP is in list
3. Status should be "Active"

### Step 4: Check Credentials
1. MongoDB Atlas → Database Access
2. Find your user in list
3. Verify username matches MONGO_URI
4. If password wrong, create new user with new password

### Step 5: Check Cluster Exists
1. MongoDB Atlas → Clusters
2. Your cluster should be listed
3. Status should be "Active" (not "paused")

### Step 6: Test Locally
```bash
cd backend
# Set MONGO_URI in .env
npm start
# Should see: ✓ MongoDB connected successfully
```

### Step 7: Update Render and Deploy
1. Set corrected MONGO_URI in Render Environment
2. Click "Deploy"
3. Check logs for connection success

---

## Common Error Messages & Solutions

### Error: "bad auth : authentication failed"
**Causes:**
1. Wrong username or password
2. Special characters not URL-encoded
3. IP not whitelisted
4. Database user doesn't exist

**Fix:** Follow "Troubleshooting Steps" above

### Error: "MongoServerError: connect ENOTFOUND cluster.mongodb.net"
**Causes:**
1. Cluster name wrong
2. Cluster deleted
3. Network issue

**Fix:** Verify cluster exists in MongoDB Atlas and name is correct

### Error: "MongoServerError: not authorized on admin"
**Causes:**
1. Database user doesn't have permissions
2. Wrong authSource

**Fix:** Recreate database user with "Read and write to any database" permissions

### Error: "connect ETIMEDOUT"
**Causes:**
1. IP not whitelisted
2. MongoDB Atlas service down
3. Network connectivity issue

**Fix:** Check IP whitelist and MongoDB Atlas status page

---

## Checklist Before Deploying

- [ ] MONGO_URI environment variable set in Render
- [ ] Connection string starts with `mongodb+srv://`
- [ ] Username and password correct (test locally first)
- [ ] Special characters in password are URL-encoded
- [ ] Database name included in connection string
- [ ] IP whitelisted in MongoDB Atlas (0.0.0.0/0 or Render IP)
- [ ] Database user exists and has read/write permissions
- [ ] Cluster is active (not paused)
- [ ] Connection string tested locally (npm start works)
- [ ] No spaces or extra characters in MONGO_URI
- [ ] Clicked "Deploy" after setting variables

---

## Quick Fix (If Stuck)

If everything still fails:

### Option 1: Create New Database User
1. MongoDB Atlas → Database Access
2. Click "Add New Database User"
3. Generate random password
4. Set permissions to "Read and write to any database"
5. Use new credentials in MONGO_URI

### Option 2: Pause and Restart Cluster
1. MongoDB Atlas → Clusters
2. Click "..." menu on your cluster
3. Click "Pause" then wait
4. Click "Resume" and wait for startup
5. Try connecting again

### Option 3: Create New Cluster
If cluster is corrupted:
1. Create new free cluster
2. Create database user
3. Get new connection string
4. Update MONGO_URI in Render
5. Deploy

---

## Testing After Fix

Once MongoDB connects, verify:

```bash
# 1. Check health endpoint works
curl https://your-app.onrender.com/api/health
# Should return: {"status":"ok","environment":"production"}

# 2. Check server logs
# In Render dashboard, should see:
# ✓ MongoDB connected successfully
# ✓ Database: portfolio
# ✓ Server running on port [PORT]

# 3. Test contact form
# Visit https://your-app.onrender.com
# Fill and submit contact form
# Check if inquiry saved to MongoDB
```

---

## Still Stuck?

**Double-check:**
1. MONGO_URI set in Render Environment (not in .env file)
2. Password special characters URL-encoded
3. IP whitelisted in MongoDB Atlas
4. Connection string has database name
5. Render deployed AFTER setting variables
6. Waited 5+ minutes after deployment

**Get logs:**
1. Go to Render dashboard
2. Click your service
3. Scroll down to "Logs"
4. Look for MongoDB connection message
5. Check for specific error message

**Common mistake:**
- Setting MONGO_URI in `.env` file won't work on Render
- Must set in Render Environment dashboard
- `.env` files don't get deployed to Render

---

## Example: Complete Working Setup

**MongoDB Atlas:**
- Cluster name: `cluster0`
- Database user: `portfolio_user`
- Password: `Str0ng!Pass@123` (URL-encoded: `Str0ng%21Pass%40123`)
- Database: `portfolio`
- IP whitelisted: `0.0.0.0/0`

**Render Environment:**
```
MONGO_URI=mongodb+srv://portfolio_user:Str0ng%21Pass%40123@cluster0.mongodb.net/portfolio?retryWrites=true&w=majority
```

**Result on Render:**
```
✓ MongoDB connected successfully
✓ Database: portfolio
✓ Host: cluster0.mongodb.net
```

---

*Fix MongoDB authentication issues and your Render deployment will work!*
