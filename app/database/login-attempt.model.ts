import mongoose, { Schema } from "mongoose";

const LoginAttemptSchema = new Schema({
  email: { type: String, lowercase: true },
  ip: { type: String },
  type: { type: String, enum: ["login", "registration"], default: "login" },
  createdAt: { type: Date, default: Date.now, expires: 900 },
});

export default mongoose.models.LoginAttempt ?? mongoose.model("LoginAttempt", LoginAttemptSchema);
