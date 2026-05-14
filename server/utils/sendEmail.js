const sendEmail = async (options) => {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ BREVO_API_KEY not set. Skipping email send.');
    console.log(`[SIMULATED EMAIL TO ${options.email}]`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    return;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { 
          name: 'CredFlow', 
          email: process.env.EMAIL_USER || 'sky143c@gmail.com' 
        },
        to: [{ email: options.email }],
        subject: options.subject,
        textContent: options.message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Brevo API Error:', data);
      throw new Error(data.message || 'Email sending failed');
    }

    console.log(`✅ Email sent successfully to ${options.email} (Message ID: ${data.messageId})`);
  } catch (error) {
    console.error('❌ Email Error:', error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

module.exports = sendEmail;
