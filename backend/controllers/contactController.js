const Inquiry = require('../models/Inquiry');
const { sendInquiryEmail } = require('../utils/email');

exports.submitInquiry = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const inquiry = new Inquiry({ name, email, message });
    await inquiry.save();

    try {
      await sendInquiryEmail({ name, email, message });
    } catch (emailError) {
      console.warn('Contact email notification failed:', emailError.message);
    }

    res.status(201).json({ message: 'Inquiry submitted successfully.' });
  } catch (error) {
    next(error);
  }
};
