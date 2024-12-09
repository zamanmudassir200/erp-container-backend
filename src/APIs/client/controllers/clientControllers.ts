import bcrypt from 'bcrypt';
import config from '../../../config/config';
import Joi from 'joi';
import {
  verifyResetToken,
  updateClientPassword,
  findClientByEmail,
  saveResetToken,
} from '../repository/clientRepository';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer'; // Importing nodemailer

import { registerClient, loginClient } from '../services/clientService';
import {
  clientValidation,
  loginValidation,
} from '../validations/clientValidation';
import { IClient } from '../models/clientModel';
import jwt from 'jsonwebtoken';

// JWT_SECRET key
const JWT_SECRET = config.TOKENS.ACCESS.SECRET;
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: config.EMAIL_USER || '', // Your email
    pass: config.EMAIL_PASS || '', // Your email app password
  },
});

// Register client controller
export const createClient = async (req: any, res: any) => {
  try {
    const { error } = clientValidation.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const clientData: IClient = req.body;
    const newClient = await registerClient(clientData);

    const token = jwt.sign(
      { id: newClient._id, email: newClient.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ client: newClient, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const verify_token = async (req: any, res: any) => {
  try {
    if (req) {
    }
    res.status.send('token verified');
  } catch (e: any) {
    res.status(400).send('token nt fund');
  }
};

// Login client controller
export const loginClientController = async (req: any, res: any) => {
  try {
    const { error } = loginValidation.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { username, password } = req.body; // Use username instead of email
    const { token, client } = await loginClient(username, password);

    res.status(200).json({ token, client });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

const passwordValidation = (password: string) => {
  const upperCasePattern = /[A-Z]/;
  const numberPattern = /[0-9]/;
  const specialCharacterPattern = /[!@#$%^&*(),.?":{}|<>]/;

  return (
    upperCasePattern.test(password) &&
    numberPattern.test(password) &&
    specialCharacterPattern.test(password) &&
    password.length >= 8
  );
};

export const updatePassword = async (req: any, res: any): Promise<Response> => {
  try {
    const { token, newPassword } = req.body;

    if (!passwordValidation(newPassword)) {
      return res.status(400).json({
        message:
          'Password must contain at least one uppercase letter, one number, one special character, and be at least 8 characters long.',
      });
    }

    const client = await verifyResetToken(token);
    if (!client) {
      return res
        .status(400)
        .json({ message: 'Invalid or expired reset token' });
    }

    client.password = await bcrypt.hash(newPassword, 10);
    await updateClientPassword(client.id, client.password);

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

// Function to send reset email using Nodemailer
const sendResetEmail = async (email: string, token: string) => {
  //TODO: add front end vercel url here
  const resetUrl = `https://erp-frontend-orcin.vercel.app/updatePassword?token=${token}`;

  try {
    const response = await transporter.sendMail({
      from: `"Coderatory" <${config.EMAIL_USER}>`, // Sender email address
      to: email, // Receiver's email
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });

    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw new Error('Failed to send reset email');
  }
};

export const resetPassword = async (req: any, res: any): Promise<Response> => {
  const { email } = req.body;

  const { error } = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
  }).validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const user = await findClientByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const resetToken = uuidv4();
  const tokenExpiration = Date.now() + 3600000;

  await saveResetToken(user.id, resetToken, tokenExpiration);
  await sendResetEmail(email, resetToken);

  return res.status(200).json({ message: 'Password reset email sent' });
};
