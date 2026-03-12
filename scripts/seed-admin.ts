import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../app/database/admin.model";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set");

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log("Usage: npx tsx scripts/seed-admin.ts <email> <password>");
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGODB_URI!);

  const hash = await bcrypt.hash(password, 12);
  const admin = await Admin.findOneAndUpdate(
    { email },
    { email, password: hash },
    { upsert: true, new: true }
  );

  console.log(`Admin created: ${admin.email}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
