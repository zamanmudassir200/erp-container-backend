import { Request, Response } from 'express';
import Employee from '../employeedata/model/employeemodel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../../config/config';
import transporter from './emailconfiguration/emailcon';
// import logger from "../../handlers/logger";

interface secret {
  JWT_SECRET_KEY: string; // Define JWT_SECRET_KEY as a string
}
const CONFIG: secret = {
  JWT_SECRET_KEY: config.JWT_SECRET_KEY || '', // Provide a fallback
};
// const JWT_SECRET = config.A
export const registerEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      username,
      email,
      password,
      confirmPassword,
      phoneno,
      role,
      address,
      cnic_no,
      profilePic,
      // department,
    } = req.body;
    // logger.info(`enpploye`, { meta: { ...req } });
    if (!username || !email) {
      res.status(400).json({ message: 'Username and email are required' });
      return;
    }

    // const normalizedUsername = username.toLowerCase();
    const normalizedEmail = email.toLowerCase();

    // Check if username or email already exists (without regex)
    const existingEmployee = await Employee.findOne({
      $or: [{ username }, { email: normalizedEmail }],
    });

    if (existingEmployee) {
      res.status(400).json({
        error:
          existingEmployee.username === username
            ? 'Username already exists. Please choose a unique username.'
            : 'Email already exists. Please choose a unique email.',
      });
      return;
    }

    // Validation for password mismatch
    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // Validate password strength
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        message:
          'Password must be between 8 to 20 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
      });
      return;
    }

    // Hash password before saving it
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds for bcrypt

    // Create a new employee with the hashed password
    const newEmployee = new Employee({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      phoneno,
      role,
      address,
      cnic_no,
      profilePic,
      // department,
    });
    // Save employee to the database

    await newEmployee.save();

    // Respond with success message and employee data
    res.status(201).json(newEmployee);
  } catch (error: any) {
    console.error('Error:', error); // Log the actual error for debugging

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.log('Field ', field);
      res.status(400).json({
        message: `Duplicate value for field: ${field.toLowerCase()}. Please ensure the ${field.toLowerCase()} is unique. `,
      });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred.' });
    }
  }
};

export const loginEmployee = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // Change return type to Promise<Response>
  try {
    const { username, password } = req.body;

    // Find employee by email
    const employee = await Employee.findOne({ username });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: employee._id, username: employee.username }, // Customize payload as needed
      CONFIG.JWT_SECRET_KEY, // Secret key for signing JWT
      { expiresIn: '1h' } // Token expiration (optional)
    );
    res.cookie('token', token, {
      httpOnly: true, // Helps prevent client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Use secure cookie in production
      sameSite: 'strict', // Ensures cookie is sent only to same-site requests
      maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    });

    // Respond with success message and token
    return res.status(200).json({
      message: 'Login successful',
      token, // Include the generated JWT token in the response
      employee: {
        username: employee.username,
        email: employee.email,
        phoneno: employee.phoneno,
        address: employee.address,
        cnic_no: employee.cnic_no,
        profilePic: employee.profilePic,
        role: employee.role,
      },
    });
  } catch (error) {
    console.error('Errorasdas', error); // Log the error for better debugging
    return res
      .status(500)
      .json({ message: 'An error occurred', error: error || error });
  }
};

export const getAllEmployees = async (
  //@ts-ignore
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Retrieve all employees from the database
    const employees = await Employee.find();

    // If no employees are found
    if (employees.length === 0) {
      res.status(404).json({ message: 'No employees found' });
    }

    // Return all employees in the response
    res.status(200).json({
      message: 'Employees retrieved successfully',
      employees,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'An error occurred', error: error || error });
  }
};

export const getEmployeeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; // Get the 'id' parameter from the request

    // Find employee by ID
    const employee = await Employee.findById(id);

    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({
      message: 'Employee retrieved successfully',
      employee,
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error });
  }
};

export const updateEmployeeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedEmployee) {
      res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({
      message: 'Employee updated successfully',
      employee: updatedEmployee,
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error });
  }
};

export const deleteEmployeeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({
      message: 'Employee deleted successfully',
      employee: deletedEmployee,
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error });
  }
};

//forgot password using email
export const UserPasswordResetEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  if (email) {
    const user = await Employee.findOne({ email: email });

    if (user) {
      // Generate a token for resetting the password
      const secret = user._id.toString() + CONFIG.JWT_SECRET_KEY;
      const token = jwt.sign({ userID: user._id }, secret, {
        expiresIn: '15m',
      });

      // Create a link to the reset password page with the user ID and token
      const link = `http://localhost:3001/ResetPassword/${user._id}/${token}`; // Updated link

      // Send Email
      const info = await transporter.sendMail({
        from: config.EMAIL_FROM,
        to: user.email,
        subject: 'GeekShop - Password Reset Link',
        html: `
                    <div style="text-align: center; font-family: Arial, sans-serif;">
                        <h2>Password Reset Request</h2>
                        <p>You requested a password reset. Click the button below to reset your password:</p>
                        <a href="${link}" style="text-decoration: none;">
                            <button style="
                                background-color: #28a745;
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
        status: 'success',
        message: 'Password Reset Email Sent. Please check your email.',
        info: info,
      });
    } else {
      res.send({ status: 'failed', message: 'Email doesn\'t exist' });
    }
  } else {
    res.send({ status: 'failed', message: 'Email field is required' });
  }
};

export const userPasswordReset = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { password, password_confirmation } = req.body;
  const { id, token } = req.params;

  try {
    const user = await Employee.findById(id);

    if (!user) {
      return res
        .status(404)
        .send({ status: 'failed', message: 'User not found' });
    }

    const new_secret = user._id.toString() + CONFIG.JWT_SECRET_KEY;
    jwt.verify(token, new_secret);

    // Regex for password validation: at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character
    const passwordRegex =
      /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;

    if (!password || !password_confirmation) {
      return res
        .status(400)
        .send({ status: 'failed', message: 'All Fields are Required' });
    }

    // Check if password matches the regex
    if (!passwordRegex.test(password)) {
      return res.status(400).send({
        status: 'failed',
        message:
          'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    if (password !== password_confirmation) {
      return res.status(400).send({
        status: 'failed',
        message: 'New Password and Confirm New Password don\'t match',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashPassword = await bcrypt.hash(password, salt);

    await Employee.findByIdAndUpdate(user._id, {
      $set: { password: newHashPassword },
    });

    // Send a success response
    return res.send({
      status: 'success',
      message: 'Password Reset Successfully',
    });
  } catch (error) {
    // console.error(error) // Log the error for debugging
    return res
      .status(500)
      .send({ status: 'failed', message: 'Invalid Token or Server Error' });
  }
};
