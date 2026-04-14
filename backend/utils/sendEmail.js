const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log(`\n📨 Attempting to send email to: ${options.email}`);
  console.log(`   Subject: ${options.subject}`);

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Adding timeout and debug options for robustness
    connectionTimeout: 10000, 
    greetingTimeout: 5000,
    socketTimeout: 10000,
    debug: true, // Set to true to see detailed logs in console
    logger: true // Log information to console
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
    return info;
  } catch (error) {
    console.error(`❌ Email Delivery Failed:`);
    console.error(`- Error: ${error.message}`);
    console.error(`- Response: ${error.response}`);
    console.error(`- Code: ${error.code}`);
    if (error.stack) {
      console.error(`- Stack Trace: ${error.stack.split('\n')[1]}`); // Log only first line of stack
    }
    throw error; // Re-throw to handle in the controller
  }
};

module.exports = sendEmail;
