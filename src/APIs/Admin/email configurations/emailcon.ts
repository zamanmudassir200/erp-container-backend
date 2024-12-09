import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import config from '../../../config/config';

interface TransportOptions {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST || '',
  port: Number(config.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.EMAIL_USER || '', // Ensure default empty string for user
    pass: config.EMAIL_PASS || '', // Ensure default empty string for password
  },
} as TransportOptions);
export default transporter;
