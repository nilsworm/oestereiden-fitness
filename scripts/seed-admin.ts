import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { createInterface } from "readline/promises";
import Admin from "../app/database/admin.model";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set");

const MIN_PASSWORD_LENGTH = 8;

async function prompt(question: string, hidden = false): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  if (hidden) process.stdout.write(question);
  const answer = hidden
    ? await new Promise<string>((resolve) => {
        process.stdin.once("data", (data) => {
          process.stdout.write("\n");
          resolve(data.toString().trim());
        });
      })
    : await rl.question(question);
  rl.close();
  return answer.trim();
}

async function seed() {
  const email = await prompt("Admin E-Mail: ");
  if (!email) { console.error("E-Mail ist erforderlich."); process.exit(1); }

  const password = await prompt("Passwort (min. 8 Zeichen): ", true);
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`);
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI!);

  const hash = await bcrypt.hash(password, 12);
  const admin = await Admin.findOneAndUpdate(
    { email },
    { email, password: hash },
    { upsert: true, new: true }
  );

  console.log(`Admin erstellt: ${admin.email}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
