import mongoose, { Document, Model, ObjectId, Schema } from 'mongoose';

interface IUser extends Document {
  _id: ObjectId;
  email: string;
  password: string;
  username: string;
  lastLogin?: Date;
  otp: string;
  otpExpiresAt: Date;
  isVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: Date;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
  createdAt?: Date; // Provided by Mongoose timestamps
  updatedAt?: Date; // Provided by Mongoose timestamps
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiresAt: {
      type: Date,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>('Admin', userSchema);

export { User, IUser };
