# Quick Deployment Checklist

## Pre-Deployment (Local Testing)

### Environment Setup
- [ ] `.env` file created in `backend/` directory
- [ ] All environment variables from `.env.example` are configured
- [ ] `NODE_ENV=development` or `NODE_ENV=production`
- [ ] `MONGO_URI` points to valid MongoDB Atlas connection

### MongoDB Atlas
- [ ] Account created at mongodb.com/cloud/atlas
- [ ] Free cluster created
- [ ] Database user created with read/write permissions
- [ ] Connection string obtained and verified
- [ ] Network access allows your IP (or 0.0.0.0/0 for testing)

### Local Testing
```bash
cd backend
npm install
npm run dev
```
- [ ] Server starts on port 5000
- [ ] "✓ MongoDB connected successfully" message appears
- [ ] No error messages in console

### API Testing
- [ ] `GET /api/health` returns 200
- [ ] `POST /api/contact` accepts test data
- [ ] `POST /api/admin/login` accepts credentials
- [ ] No 404 errors on static files (index.html, admin.html)

### Code Quality
- [ ] All files have no syntax errors
- [ ] No hardcoded secrets in code
- [ ] Error handling is in place
- [ ] Console logs are appropriate for debugging

---

## Render Deployment

### Repository Setup
- [ ] GitHub repository created and code pushed
- [ ] Procfile present in root directory
- [ ] `backend/package.json` configured with correct start script
- [ ] `backend/.env.example` updated with all variables

### Render Configuration
- [ ] Render account created
- [ ] GitHub repository connected to Render
- [ ] New Web Service created

### Build & Start Commands
- [ ] Build Command: `cd backend && npm install`
- [ ] Start Command: `cd backend && npm start`
- [ ] Node version: 20.x
- [ ] Plan: Free tier

### Environment Variables in Render
- [ ] `NODE_ENV` = production
- [ ] `MONGO_URI` = [YOUR_MONGODB_ATLAS_URI]
- [ ] `JWT_SECRET` = [STRONG_RANDOM_STRING]
- [ ] `ADMIN_EMAIL` = [YOUR_ADMIN_EMAIL]
- [ ] `ADMIN_PASSWORD` = [YOUR_ADMIN_PASSWORD]
- [ ] `EMAIL_HOST` = [SMTP_HOST]
- [ ] `EMAIL_PORT` = [SMTP_PORT]
- [ ] `EMAIL_SECURE` = false (usually for port 587)
- [ ] `EMAIL_USER` = [EMAIL_ACCOUNT]
- [ ] `EMAIL_PASS` = [EMAIL_PASSWORD_OR_APP_PASSWORD]
- [ ] `EMAIL_FROM` = [SENDER_ADDRESS]

### MongoDB Atlas for Render
- [ ] MongoDB Atlas IP whitelist includes Render IP
- [ ] Alternative: Allow 0.0.0.0/0 (less secure, free tier)
- [ ] Database user password confirmed
- [ ] Connection string verified with username and password

### Render Deployment
- [ ] Click "Deploy" button
- [ ] Wait for build to complete
- [ ] Check build logs for errors
- [ ] Verify deployment successful

### Post-Deployment Testing
- [ ] `GET https://your-app.onrender.com/api/health` responds
- [ ] Frontend pages load (index.html, admin.html)
- [ ] Admin login endpoint works
- [ ] Contact form accepts submissions
- [ ] Check Render logs for errors

---

## Troubleshooting Commands

### View Server Logs
```bash
# Local
npm run dev

# Render: Check dashboard logs or use
# Render CLI: render logs --service-id=YOUR_SERVICE_ID
```

### Test Endpoints
```bash
# Health check
curl https://your-app.onrender.com/api/health

# Contact form
curl -X POST https://your-app.onrender.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "message":"This is a test"
  }'

# Admin login
curl -X POST https://your-app.onrender.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@example.com",
    "password":"your_admin_password"
  }'
```

### Check MongoDB Connection
```bash
# In local development, check logs for:
# "✓ MongoDB connected successfully"
# "✓ Database: portfolio"

# Or add to server.js for debugging:
# console.log('Connection:', connection.connection.name);
```

---

## Common Issues

### Issue: MONGO_URI not set
**Solution:**
- Check `.env` file exists in `backend/` directory
- Verify `MONGO_URI=` line exists with correct value
- On Render, check environment variables in dashboard
- Restart server after adding env variable

### Issue: MongoDB authentication failed
**Solution:**
- Verify username and password are URL-encoded in URI
- Check MongoDB Atlas user exists and has correct permissions
- Verify IP whitelist in MongoDB Atlas includes Render IP
- Test connection string locally first

### Issue: Frontend returns 404
**Solution:**
- Verify `index.html` and `admin.html` exist in project root
- Check `server.js` static path: should be `path.join(__dirname, '..')`
- Ensure wildcard route `app.get('*', ...)` is defined
- Restart server

### Issue: Email not sending
**Solution:**
- Verify all `EMAIL_*` variables are set
- For Gmail: use app-specific password, not regular password
- Test SMTP credentials locally first
- Check email configuration error logs

### Issue: Build fails on Render
**Solution:**
- Check build command includes `cd backend && npm install`
- Verify `backend/package.json` exists
- Ensure Node version is 20.x
- Check for syntax errors in code locally first

### Issue: Port already in use
**Solution:**
- Render automatically assigns PORT environment variable
- Server correctly uses `process.env.PORT || 5000`
- Verify port 5000 is free locally for development

---

## File Structure for Deployment

```
Mywebsite/
├── index.html          ✓ Must exist in root
├── admin.html          ✓ Must exist in root
├── admin.js            ✓ Frontend JS
├── script.js           ✓ Frontend JS
├── style.css           ✓ Frontend CSS
├── Procfile            ✓ Created - for Render
├── render.yaml         ✓ Created - optional, for Render config
├── BACKEND_FIXES.md    ✓ Created - documentation
│
├── backend/
│   ├── .env.example    ✓ Updated - template for env vars
│   ├── package.json    ✓ OK - node 20.x specified
│   ├── server.js       ✓ Updated - fixed frontend path, improved error handling
│   │
│   ├── config/
│   │   └── db.js       ✓ Updated - better MongoDB connection
│   │
│   ├── controllers/
│   │   ├── adminController.js       ✓ Updated - better JWT handling
│   │   ├── contactController.js     ✓ OK
│   │   └── downloadController.js    ✓ OK
│   │
│   ├── middleware/
│   │   └── auth.js     ✓ Updated - removed hardcoded secret
│   │
│   ├── models/
│   │   ├── Inquiry.js
│   │   └── DownloadLog.js
│   │
│   ├── routes/
│   │   ├── admin.js
│   │   ├── contact.js
│   │   └── download.js
│   │
│   ├── utils/
│   │   └── email.js    ✓ Updated - better error handling
│   │
│   └── DEPLOYMENT.md   ✓ Created - comprehensive guide
```

---

## Security Checklist

- [ ] No hardcoded secrets in any `.js` files
- [ ] `.env` file is in `.gitignore` (not committed to GitHub)
- [ ] All environment variables are strong random strings
- [ ] JWT_SECRET is at least 32 characters
- [ ] ADMIN_PASSWORD is strong (uppercase, lowercase, numbers, special chars)
- [ ] Email credentials use app-specific passwords (not main password)
- [ ] Helmet middleware configured for security headers
- [ ] CORS properly configured
- [ ] No console.log of sensitive data
- [ ] MongoDB user has limited permissions (read/write specific database only)
- [ ] IP whitelist in MongoDB Atlas is configured

---

## Performance Notes

✓ Connection pooling: 5-10 MongoDB connections
✓ Timeouts: 10s connection, 45s socket
✓ IPv4: Forced for better Render compatibility
✓ Graceful shutdown: Handles SIGTERM properly
✓ Error handling: Prevents server crashes
✓ Logging: Morgan middleware for request logging

---

## Support & Debugging

### Enable Debug Logs
Add to `backend/server.js`:
```javascript
if (process.env.DEBUG) {
  console.log('Debug mode enabled');
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGO_HOST: process.env.MONGO_URI?.split('@')[1],
  });
}
```

### Monitor in Production
- Check Render dashboard logs regularly
- Monitor MongoDB Atlas for connection issues
- Set up error alerts if possible
- Keep dependencies updated

### Useful Resources
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Render Docs: https://render.com/docs
- Express Docs: https://expressjs.com
- Mongoose Docs: https://mongoosejs.com
- Node.js Docs: https://nodejs.org/docs

---

## Final Checklist Before Going Live

- [ ] All files saved and committed
- [ ] Local testing passed all checks
- [ ] MongoDB Atlas cluster created and accessible
- [ ] Render environment variables all set
- [ ] Build and start commands verified
- [ ] Health check endpoint responding
- [ ] Admin login working
- [ ] Contact form accepting submissions
- [ ] Frontend pages loading
- [ ] Email notifications working (test email sent)
- [ ] Logs checked for warnings/errors
- [ ] Security checklist passed
- [ ] DNS/domain configured if needed
- [ ] HTTPS enabled (automatic with Render)

---

## Deployment Success = ✓

When everything is working:
1. Frontend loads at your app URL
2. Contact form submits and saves to MongoDB
3. Admin can login with credentials
4. Download tracking logs events
5. Email notifications are sent
6. Health check returns 200
7. Logs show no errors
8. MongoDB Atlas shows active connections
