const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log(`\n📨 Attempting to send email to: ${options.email}`);
  console.log(`Subject: ${options.subject}`);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Campus Nova" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ Email Delivery Failed:`);
    console.error(`- Response: ${error.response}`);
    console.error(`- Code: ${error.code}`);
    throw error; // Re-throw to handle in the controller
  }
};

module.exports = sendEmail;
