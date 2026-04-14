const sendEmail = async (options) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const EMAIL_USER = process.env.EMAIL_USER;

  if (!BREVO_API_KEY) {
    console.error('❌ Missing BREVO_API_KEY in environment variables.');
    throw new Error('Email service configuration missing.');
  }

  console.log(`\n📨 Attempting to send email via Brevo API to: ${options.email}`);
  console.log(`   Subject: ${options.subject}`);

  const payload = {
    sender: { name: 'Campus Nova', email: EMAIL_USER },
    to: [{ email: options.email }],
    subject: options.subject,
    htmlContent: options.html,
    textContent: options.message
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Email sent successfully via Brevo: ${data.messageId}`);
      return data;
    } else {
      console.error(`❌ Brevo API Error:`, data);
      throw new Error(data.message || 'Failed to send email via Brevo');
    }
  } catch (error) {
    console.error(`❌ Email Delivery Failed (HTTP):`, error.message);
    throw error;
  }
};

module.exports = sendEmail;
