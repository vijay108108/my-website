const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

let connectionPromise = null;
let listenersRegistered = false;

const getMongoErrorHints = (error) => {
  const message = error && error.message ? error.message : '';

  if (message.includes('authentication failed') || message.includes('bad auth')) {
    return [
      'Check your MongoDB Atlas username and password.',
      'URL-encode the password if it contains special characters.',
      'Confirm the database user exists and has access to this database.',
    ];
  }

  if (message.includes('ENOTFOUND') || message.includes('querySrv')) {
    return ['Check the MongoDB host or cluster name in MONGO_URI.'];
  }

  if (message.includes('ECONNREFUSED') || message.includes('Server selection timed out')) {
    return [
      'Ensure MongoDB Atlas Network Access allows this service.',
      'Confirm the cluster is running and reachable.',
    ];
  }

  if (message.includes('MONGO_URI')) {
    return ['Set the MONGO_URI environment variable before starting the backend.'];
  }

  return ['Review MONGO_URI, Atlas network access, and database user permissions.'];
};

const registerConnectionListeners = () => {
  if (listenersRegistered) {
    return;
  }

  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    console.log('[MongoDB] Connection established');
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Connection disconnected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('[MongoDB] Connection error:', error.message);
  });
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        'MongoDB URI not found. Set MONGO_URI environment variable with your MongoDB Atlas connection string. ' +
        'Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority'
      );
    }

    registerConnectionListeners();
    console.log('[MongoDB] Connecting...');

    connectionPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 0,
    });

    const connection = await connectionPromise;
    const { name, host, port, readyState } = connection.connection;

    console.log('[MongoDB] Connected successfully');
    console.log(`[MongoDB] Database: ${name || 'unknown'}`);
    console.log(`[MongoDB] Host: ${host || 'unknown'}${port ? `:${port}` : ''}`);
    console.log(`[MongoDB] Ready state: ${readyState}`);

    return connection.connection;
  } catch (error) {
    connectionPromise = null;

    console.error('[MongoDB] Connection failed:', error.message);
    getMongoErrorHints(error).forEach((hint) => {
      console.error(`[MongoDB] Hint: ${hint}`);
    });

    return null;
  }
};

module.exports = connectDB;
