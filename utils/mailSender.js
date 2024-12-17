// utils/mailSender.js
const nodemailer = require('nodemailer');

const mailSender = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        html,
    };

    return transporter.sendMail(mailOptions);
};

module.exports = mailSender;
