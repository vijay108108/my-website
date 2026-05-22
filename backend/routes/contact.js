const express = require('express');
const { submitInquiry } = require('../controllers/contactController');

const router = express.Router();

router.post('/', submitInquiry);

module.exports = router;
