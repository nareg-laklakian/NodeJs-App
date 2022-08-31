const nodemailer = require('nodemailer');

// what we need to insert is 1- the email address where we send an email to , 2- the subject line ,3- the email content and etc...

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // in gmail activate the "less secure app" option
  });
  // 2) Define the email options

  const mailOptions = {
    from: 'Laklak Laklak <laklak1@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) Actually send the email

  await transporter.sendMail(mailOptions);
  // the line above returns a promise so it is an asynchronous function
};

module.exports = sendEmail;
