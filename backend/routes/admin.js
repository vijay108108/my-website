const express = require('express');
const { login, getStats, listInquiries, listDownloads } = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.get('/stats', authMiddleware, getStats);
router.get('/inquiries', authMiddleware, listInquiries);
router.get('/downloads', authMiddleware, listDownloads);

module.exports = router;
