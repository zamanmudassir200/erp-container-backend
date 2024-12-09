import mongoose, { Schema, Document } from "mongoose";

export interface IClient extends Document {
  username: string;
  password: string;
  phone: string;
  email: string; // we will get those 2 when user req a container
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
}

export interface IClientInput {
  username: string;
  email: string;
  phone: string;
  password: string;
}

// const clientSchema: Schema = new Schema(
//   {
//     username: { type: String, required: true, unique: true }, // Unique username
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     phone: { type: String, required: true },
//     resetPasswordToken: { type: String },
//     resetPasswordExpires: { type: Number },
//   },
//   { timestamps: true }
// );

const clientSchema = new Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Client = mongoose.model<IClient>("Client", clientSchema);
