require('dotenv').config()
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use false for STARTTLS; true for SSL on port 465
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

const sendEmail = async (to, subject, text, html) => {
  console.log({
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  })
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
