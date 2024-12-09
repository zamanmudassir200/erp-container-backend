// import bcryptjs from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { Request, Response } from 'express';
// import config from '../../../config/config';
// import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie';
// import { User, IUser } from '../models/admin.model';
// import transporter from '../email configurations/emailcon';

// const generateOTP = (): string => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// export const signup = async (req: Request, res: Response): Promise<void> => {
//   const { email, password, username } = req.body;

//   try {
//     if (!email || !password || !username) {
//       throw new Error('All fields are required.');
//     }
//     const existingEmployee = await User.findOne({ username });
//     if (existingEmployee) {
//       res.status(400).json({
//         error: 'username already exists. Please choose a unique username.',
//       });
//       return;
//     }

//     // Check if user already exists
//     const userAlreadyExists = await User.findOne({ email });
//     if (userAlreadyExists) {
//       res.status(400).json({ success: false, message: 'User already exists.' });
//       return;
//     }

//     // Hash the password
//     const hashedPassword = await bcryptjs.hash(password, 10);

//     // Generate OTP
//     const otp = generateOTP();

//     // Save user with OTP and expiry time
//     const user = new User<Partial<IUser>>({
//       email,
//       password: hashedPassword,
//       username,
//       otp,
//       otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
//       isVerified: false, // Add this field to your model if not already present
//     });

//     await user.save();

//     // Send verification email
//     await transporter.sendMail({
//       from: '"Coderatory" <coderatory@gmail.com>', // Sender's email
//       to: email, // Receiver's email
//       subject: 'you Entered signup data  Verify your Email using  OTP', // Subject line
//       text: 'Verify your Email', // Plain text body
//       html: `<p>Your verification code is: <strong>${otp}</strong></p>`, // HTML body
//     });

//     // Respond to client
//     res.status(201).json({
//       success: true,
//       message: 'User created successfully. Please verify your email.',
//     });
//   } catch (error: any) {
//     console.error('Signup error:', error);
//     res.status(400).json({ success: false, message: error.message });
//   }
// };
import bcryptjs from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import config from "../../../config/config";
import { User, IUser } from "../models/admin.model";
import transporter from "../email configurations/emailcon";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie";

const generateOTP = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, password, username } = req.body;

  try {
    if (!email || !password || !username) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    const existingEmployee = await User.findOne({ username });
    if (existingEmployee) {
      res.status(400).json({
        error: "Username already exists. Please choose a unique username.",
      });
      return;
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      res.status(400).json({ success: false, message: "User already exists." });
      return;
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const otp = generateOTP();

    const user: IUser = new User({
      email,
      password: hashedPassword,
      username,
      otp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
    });

    await user.save();

    await transporter.sendMail({
      from: config.EMAIL_FROM,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully. Please verify your email.",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

    generateTokenAndSetCookie(res, user._id.toString()); // Ensure `_id` is converted to a string

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error: any) {
    console.error("Error in login", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Log out user
export const logout = (_req: Request, res: Response): void => {
  try {
    res.clearCookie("token"); // Replace 'token' with the actual cookie name if different
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  if (email) {
    const user = await User.findOne({ email: email });

    if (user) {
      // Generate a token for resetting the password
      const secret = user._id.toString() + config.JWT_SECRET_KEY;
      const token = jwt.sign({ userID: user._id }, secret, {
        expiresIn: "15m",
      });

      // Create a link to the reset password page with the user ID and token
      const link = `http://localhost:3001/ResetPassword/${user._id}/${token}`; // Updated link

      // Send Email
      const info = await transporter.sendMail({
        from: config.EMAIL_FROM,
        to: user.email,
        subject: "Reset Your Password - Mail",
        html: `
                    <div style="text-align: center; font-family: Arial, sans-serif;">
                        <h2>Password Reset Request</h2>
                        <p>You requested a password reset. Click the button below to reset your password:</p>
                        <a href="${link}" style="text-decoration: none;">
                            <button style="
                                background-color:brown;;
                                color: white;
                                padding: 10px 20px;
                                border: none;
                                border-radius: 5px;
                                font-size: 16px;
                                cursor: pointer;
                            ">
                                Reset Password
                            </button>
                        </a>
                        <p>If you did not request this, please ignore this email.</p>
                    </div>
                `,
      });

      res.send({
        status: "success",
        message: "Password Reset Email Sent. Please check your email.",
        info: info,
      });
    } else {
      res.send({ status: "failed", message: "Email doesn't exist" });
    }
  } else {
    res.send({ status: "failed", message: "Email field is required" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { password, password_confirmation } = req.body;
  const { id, token } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .send({ status: "failed", message: "User not found" });
    }

    const new_secret = user._id.toString() + config.JWT_SECRET_KEY;
    jwt.verify(token, new_secret);

    // Regex for password validation: at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!password || !password_confirmation) {
      return res
        .status(400)
        .send({ status: "failed", message: "All Fields are Required" });
    }

    // Check if password matches the regex
    if (!passwordRegex.test(password)) {
      return res.status(400).send({
        status: "failed",
        message:
          "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    if (password !== password_confirmation) {
      return res.status(400).send({
        status: "failed",
        message: "New Password and Confirm New Password don't match",
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const newHashPassword = await bcryptjs.hash(password, salt);

    await User.findByIdAndUpdate(user._id, {
      $set: { password: newHashPassword },
    });

    // Send a success response
    return res.send({
      status: "success",
      message: "Password Reset Successfully",
    });
  } catch (error) {
    // console.error(error) // Log the error for debugging
    return res
      .status(500)
      .send({ status: "failed", message: "Invalid Token or Server Error" });
  }
};

// Check authentication status of a user
export const checkAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    console.error("Error in checkAuth", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
