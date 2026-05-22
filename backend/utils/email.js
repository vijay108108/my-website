const nodemailer = require('nodemailer');

const sendInquiryEmail = async ({ name, email, message }) => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration is missing in environment variables.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const adminRecipient = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const subject = `New portfolio inquiry from ${name}`;
  const html = `
    <h2>New inquiry received</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: adminRecipient,
    subject,
    html,
  });
};

module.exports = { sendInquiryEmail };
