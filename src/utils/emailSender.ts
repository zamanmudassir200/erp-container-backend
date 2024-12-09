// utils/emailSender.ts
import nodemailer from 'nodemailer';
import config from '../config/config';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: config.EMAIL_USER || '',
    pass: config.EMAIL_PASS || '',
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const response = await transporter.sendMail({
      from: `"YourApp" <${config.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent:', response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email delivery failed');
  }
};
