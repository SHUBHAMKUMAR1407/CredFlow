const https = require('https');

const sendEmail = async (options) => {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ BREVO_API_KEY not set. Skipping email send.');
    console.log(`[SIMULATED EMAIL TO ${options.email}]`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    return;
  }

  const postData = JSON.stringify({
    sender: { 
      name: 'CredFlow', 
      email: process.env.EMAIL_USER || 'sky143c@gmail.com' 
    },
    to: [{ email: options.email }],
    subject: options.subject,
    textContent: options.message,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(postData),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ Email sent successfully to ${options.email} (ID: ${parsed.messageId})`);
            resolve(parsed);
          } else {
            console.error('❌ Brevo API Error:', parsed);
            reject(new Error(parsed.message || 'Email sending failed'));
          }
        } catch (e) {
          console.error('❌ Brevo Response Parse Error:', data);
          reject(new Error('Invalid response from email service'));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Brevo Connection Error:', error.message);
      reject(new Error(`Email delivery failed: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
};

module.exports = sendEmail;
