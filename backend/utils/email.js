const nodemailer = require('nodemailer');

const REQUIRED_EMAIL_ENV_VARS = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'];
let transporter = null;

const isEmailConfigured = () => REQUIRED_EMAIL_ENV_VARS.every((key) => Boolean(process.env[key]));

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  return transporter;
};

const sendInquiryEmail = async ({ name, email, message }) => {
  if (!isEmailConfigured()) {
    return {
      sent: false,
      skipped: true,
      reason: 'Email notification skipped because SMTP configuration is incomplete.',
    };
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br>');
  const adminRecipient = process.env.EMAIL_TO || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: adminRecipient,
    replyTo: email,
    subject: `New portfolio inquiry from ${name}`,
    text: `New Inquiry Received\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <h2>New Inquiry Received</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
      <hr>
      <p><small>This message was sent from your portfolio website.</small></p>
    `,
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log('[Email] Contact notification sent:', info.messageId || info.response || 'ok');

    return {
      sent: true,
      skipped: false,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    transporter = null;
    error.message = `Contact email notification failed: ${error.message}`;
    throw error;
  }
};

module.exports = {
  sendInquiryEmail,
  isEmailConfigured,
};
