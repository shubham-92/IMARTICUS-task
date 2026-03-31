import mongoose from "mongoose";

const aiSummarySchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lessonId: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    model: { type: String, default: "gpt-4o-mini" },
    prompt: { type: String, default: "" },
    summary: { type: String, required: true }
  },
  { timestamps: true }
);

export const AiSummary = mongoose.model("AiSummary", aiSummarySchema);
