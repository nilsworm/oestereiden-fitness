import { Schema, model, models, Document } from "mongoose";

export interface ICode extends Document {
  value: string;
  updatedAt: Date;
}

const CodeSchema = new Schema<ICode>(
  {
    value: {
      type: String,
      required: [true, "Code is required"],
      match: [/^\d{4}$/, "Code must be exactly 4 digits"],
    },
  },
  { timestamps: true }
);

const Code = models.Code || model<ICode>("Code", CodeSchema);

export default Code;
