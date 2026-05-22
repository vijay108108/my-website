const express = require('express');
const { trackDownload } = require('../controllers/downloadController');

const router = express.Router();

router.post('/', trackDownload);

module.exports = router;
