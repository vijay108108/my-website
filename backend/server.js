const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const downloadRoutes = require('./routes/download');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
let server = null;
let startupPromise = null;

const getDbStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return states[mongoose.connection.readyState] || 'unknown';
};

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/contact', contactRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    database: getDbStatus(),
  });
});

// Static file serving - serve frontend files from root directory
// Use absolute path to ensure compatibility across different environments
const frontendPath = path.resolve(__dirname, '..');
const publicPath = path.join(frontendPath, 'public');
const indexPath = path.resolve(frontendPath, 'index.html');
const adminPath = path.resolve(frontendPath, 'admin.html');

// Log paths on startup for debugging
console.log(`[Path Debug] __dirname: ${__dirname}`);
console.log(`[Path Debug] frontendPath: ${frontendPath}`);
console.log(`[Path Debug] publicPath: ${publicPath}`);
console.log(`[Path Debug] indexPath: ${indexPath}`);
console.log(`[Path Debug] indexPath exists: ${fs.existsSync(indexPath)}`);

// Serve static assets (CSS, JS, images, etc.)
app.use(express.static(frontendPath));

// Route for admin page
app.get('/admin', (req, res) => {
  res.sendFile(adminPath, (err) => {
    if (err) {
      console.error('[Error] Failed to send admin.html:', err.message);
      console.error('[Error] Attempted path:', adminPath);
      return res.status(404).json({ error: 'Admin page not found', path: adminPath });
    }
  });
});

// Fallback route for SPA - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('[Error] Failed to send index.html:', err.message);
      console.error('[Error] Attempted path:', indexPath);
      console.error('[Error] File exists:', fs.existsSync(indexPath));
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Portfolio</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <h1>Portfolio Website</h1>
          <p>Frontend is loading. If this persists, check server logs.</p>
          <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
          <p>Server running on port ${PORT}</p>
        </body>
        </html>
      `);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const isMongoConnectionError =
    err.name === 'MongooseError' ||
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongoNetworkError';
  const status = err.status || (isMongoConnectionError ? 503 : 500);

  console.error('[Error] Unhandled error:', {
    status,
    message: err.message,
    path: req.path,
    method: req.method,
    url: req.url,
  });

  res.status(status).json({
    error: isMongoConnectionError ? 'Database is currently unavailable' : err.message || 'Internal server error',
    status,
    path: req.path,
  });
});

const startServer = async () => {
  if (server) {
    return server;
  }

  if (startupPromise) {
    return startupPromise;
  }

  startupPromise = (async () => {
    const dbConnection = await connectDB();

    if (!dbConnection) {
      console.warn('[Startup] MongoDB is unavailable. Starting HTTP server in degraded mode.');
    }

    server = app.listen(PORT, () => {
      console.log(`
===============================================
Server Started Successfully
-----------------------------------------------
Server running on port ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Database: ${getDbStatus()}
Frontend path: ${frontendPath}
Index.html exists: ${fs.existsSync(indexPath)}
Admin.html exists: ${fs.existsSync(adminPath)}
Node version: ${process.version}
Platform: ${process.platform}
===============================================
      `);
    });

    return server;
  })();

  return startupPromise;
};

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);

  const closeDatabase = () => {
    mongoose.connection.close(false).finally(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  };

  if (!server) {
    closeDatabase();
    return;
  }

  server.close(() => {
    console.log('Server closed');
    closeDatabase();
  });
};

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));

startServer().catch((error) => {
  console.error('[Startup] Failed to start HTTP server:', error.message);
  process.exit(1);
});
