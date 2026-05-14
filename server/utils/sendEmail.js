const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not set in .env. Skipping email send.');
    console.log(`[SIMULATED EMAIL TO ${options.email}]`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'CredFlow <onboarding@resend.dev>',
      to: [options.email],
      subject: options.subject,
      text: options.message,
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      throw new Error(error.message);
    }

    console.log(`✅ Email sent successfully to ${options.email}: ${data.id}`);
  } catch (error) {
    console.error('❌ Email Error:', error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

module.exports = sendEmail;
