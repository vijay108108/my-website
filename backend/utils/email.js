const nodemailer = require('nodemailer');

const sendInquiryEmail = async ({ name, email, message }) => {
  // Validate email configuration
  const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'];
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    throw new Error(`Email configuration incomplete. Missing: ${missingVars.join(', ')}`);
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    // Test connection
    await transporter.verify();

    const adminRecipient = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const subject = `New portfolio inquiry from ${name}`;
    const html = `
      <h2>New Inquiry Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>This message was sent from your portfolio website.</small></p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Portfolio" <${process.env.EMAIL_USER}>`,
      to: adminRecipient,
      replyTo: email,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    
    return info;
  } catch (error) {
    console.error('Email sending error:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = { sendInquiryEmail };
