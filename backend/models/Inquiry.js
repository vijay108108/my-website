const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  message: { type: String, required: true, trim: true },
  source: { type: String, default: 'website' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Inquiry', inquirySchema);
