import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, default: "", trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, default: "" },
    highestQualification: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "contacted", "converted", "rejected"],
      default: "new"
    }
  },
  { timestamps: true }
);

export const Application = mongoose.model("Application", applicationSchema);
