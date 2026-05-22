const mongoose = require('mongoose');

const downloadLogSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  ip: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DownloadLog', downloadLogSchema);
