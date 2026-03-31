import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment", required: true },
    provider: { type: String, default: "razorpay" },
    providerOrderId: { type: String, default: "" },
    providerPaymentId: { type: String, default: "" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created"
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
