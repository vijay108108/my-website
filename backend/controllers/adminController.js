const jwt = require('jsonwebtoken');
const Inquiry = require('../models/Inquiry');
const DownloadLog = require('../models/DownloadLog');

const validateAdmin = (email, password) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminEmail || !adminPassword) {
    console.error('Admin credentials not configured in environment variables');
    return false;
  }
  
  return email === adminEmail && password === adminPassword;
};

const createToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (!validateAdmin(email, password)) {
    console.warn(`Failed login attempt with email: ${email}`);
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  try {
    const token = createToken({ email, iat: Date.now() });
    res.json({ token, expiresIn: '8h' });
  } catch (error) {
    console.error('Token creation failed:', error.message);
    return res.status(500).json({ error: 'Unable to create authentication token' });
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const inquiryCount = await Inquiry.countDocuments();
    const downloadCount = await DownloadLog.countDocuments();
    const latestInquiry = await Inquiry.findOne().sort({ createdAt: -1 });

    res.json({ inquiryCount, downloadCount, latestInquiry });
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    next(error);
  }
};

exports.listInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(50);
    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error.message);
    next(error);
  }
};

exports.listDownloads = async (req, res, next) => {
  try {
    const downloads = await DownloadLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(downloads);
  } catch (error) {
    console.error('Error fetching downloads:', error.message);
    next(error);
  }
};
