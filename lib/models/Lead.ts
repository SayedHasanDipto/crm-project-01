import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILead extends Document {
  userId: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  status: "new" | "contacted" | "qualified" | "lost";
  lastContactedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, trim: true },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "lost"],
      default: "new"
    },
    lastContactedAt: { type: Date, required: true },
    notes: { type: String }
  },
  { timestamps: true }
);

const Lead: Model<ILead> =
  mongoose.models.Lead ?? mongoose.model<ILead>("Lead", LeadSchema);

export default Lead;
