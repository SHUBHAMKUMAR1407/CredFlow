const nodemailer = require('nodemailer');
const dns = require('dns');

// Force Node.js to use IPv4 instead of IPv6 for DNS resolution.
// This fixes the 'ENETUNREACH 2607:...' error on Render where IPv6 routing is unavailable.
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const sendEmail = async (options) => {
  // Use user-provided credentials or fallback to a console warning
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set in .env. Skipping actual email send.');
    console.log(`[SIMULATED EMAIL TO ${options.email}]`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports (uses STARTTLS)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CredFlow Support" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${options.email}: ${info.messageId}`);
  } catch (error) {
    console.error('❌ Nodemailer Error:', error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

module.exports = sendEmail;
