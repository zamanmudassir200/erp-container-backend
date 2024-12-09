import mongoose from 'mongoose';
import { IEmployeeModel } from '../types/employeeinterface';

const EmployeeSchema = new mongoose.Schema<IEmployeeModel>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmPassword: { type: String, required: true },
  phoneno: { type: String, required: true },
  address: { type: String, required: true },
  cnic_no: { type: String, required: true, unique: true },
  profilePic: { type: String, default: '' }, // Store uploaded image path
  role: { type: String, required: true },
  // department: {
  //   type: String,
  // },
});

const Employee = mongoose.model<IEmployeeModel>('Employee', EmployeeSchema);
export default Employee;
