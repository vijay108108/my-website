const Inquiry = require('../models/Inquiry');
const { sendInquiryEmail } = require('../utils/email');

exports.submitInquiry = async (req, res, next) => {
  try {
    const { name, email, message } = req.body || {};
    console.log('[Contact] Submission received:', {
      hasName: Boolean(name),
      hasEmail: Boolean(email),
      hasMessage: Boolean(message),
    });

    if (!name || !email || !message) {
      console.warn('[Contact] Validation failed: missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required.',
      });
    }

    const inquiry = new Inquiry({ name, email, message });
    await inquiry.save();
    console.log('[Contact] Inquiry saved:', inquiry._id.toString());

    let emailNotification = {
      sent: false,
      skipped: true,
      error: null,
    };

    try {
      const emailResult = await sendInquiryEmail({ name, email, message });
      emailNotification = {
        sent: Boolean(emailResult.sent),
        skipped: Boolean(emailResult.skipped),
        error: null,
      };

      if (emailResult.sent) {
        console.log('[Contact] Email notification sent');
      }
    } catch (emailError) {
      console.error('[Contact] Email notification failed:', emailError.message);
      emailNotification = {
        sent: false,
        skipped: false,
        error: 'Email notification failed, but your inquiry was saved.',
      };
    }

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully. I will get back to you soon.',
      emailNotification,
    });
  } catch (error) {
    console.error('[Contact] Submission failed:', error.message);
    return next(error);
  }
};
