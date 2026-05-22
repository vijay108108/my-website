const jwt = require('jsonwebtoken');
const Inquiry = require('../models/Inquiry');
const DownloadLog = require('../models/DownloadLog');

const validateAdmin = (email, password) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    return false;
  }
  return email === adminEmail && password === adminPassword;
};

const createToken = (payload) => jwt.sign(
  payload,
  process.env.JWT_SECRET || 'portfolio-secret',
  { expiresIn: '8h' }
);

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (!validateAdmin(email, password)) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = createToken({ email });
  res.json({ token });
};

exports.getStats = async (req, res, next) => {
  try {
    const inquiryCount = await Inquiry.countDocuments();
    const downloadCount = await DownloadLog.countDocuments();
    const latestInquiry = await Inquiry.findOne().sort({ createdAt: -1 });

    res.json({ inquiryCount, downloadCount, latestInquiry });
  } catch (error) {
    next(error);
  }
};

exports.listInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(50);
    res.json(inquiries);
  } catch (error) {
    next(error);
  }
};

exports.listDownloads = async (req, res, next) => {
  try {
    const downloads = await DownloadLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(downloads);
  } catch (error) {
    next(error);
  }
};
