import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    status: {
      type: String,
      enum: ["pending_payment", "active", "expired"],
      default: "pending_payment"
    },
    progressPercent: { type: Number, default: 0 },
    activatedAt: { type: Date }
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
