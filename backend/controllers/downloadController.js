const DownloadLog = require('../models/DownloadLog');

exports.trackDownload = async (req, res, next) => {
  try {
    const { fileName = 'Vijay-Vishwakarma-Resume.pdf' } = req.body;

    const log = new DownloadLog({
      fileName,
      ip: req.ip,
      userAgent: req.get('User-Agent') || 'unknown',
    });

    await log.save();

    return res.status(200).json({
      success: true,
      message: 'Download tracked successfully.',
      resumeUrl: `/${fileName}`,
    });
  } catch (error) {
    return next(error);
  }
};
