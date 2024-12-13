const nodemailer = require('nodemailer');
const fs = require('fs');

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'XXXXXXXXXXXXXXXXXXXX',
    pass: 'XXXXXXXX'
  }
});

// List of recipients
const recipients = [
  'XXXXXXXXXXXXXXXXXXXX',
  'YYYYYYYYYYYYYYYYYYYY',
];

// Email content
const mailOptions = {
  from: 'ajay.s@cisinlabs.com',
  to: recipients.join(', '),
  subject: 'Waring For Suspension',
  text: 'Testing purpose :)',
  attachments: [
    {
      filename: 'document.pdf',
      path: './document.pdf' // Path to your attachment
    }
  ]
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log(error);
  }
  console.log('Email sent: ' + info.response);
});