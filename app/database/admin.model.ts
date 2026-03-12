import { Schema, model, models, Document } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
  },
  { timestamps: true }
);

const Admin = models.Admin || model<IAdmin>("Admin", AdminSchema);

export default Admin;
