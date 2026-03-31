import crypto from "crypto";
import Razorpay from "razorpay";
import { Enrollment } from "../models/Enrollment.js";
import { Payment } from "../models/Payment.js";

const readEnv = (name) => (process.env[name] || "").trim();

const getRazorpayClient = () => {
  const keyId = readEnv("RAZORPAY_KEY_ID");
  const keySecret = readEnv("RAZORPAY_KEY_SECRET");

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

const findEnrollmentForUser = async (enrollmentId, userId) => {
  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    user: userId
  }).populate("course");

  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.statusCode = 404;
    throw error;
  }

  return enrollment;
};

export const getPaymentConfig = async (_req, res) => {
  const keyId = readEnv("RAZORPAY_KEY_ID");
  const keySecret = readEnv("RAZORPAY_KEY_SECRET");

  res.json({
    provider: "razorpay",
    keyId,
    enabled: Boolean(keyId && keySecret)
  });
};

export const createPaymentOrder = async (req, res, next) => {
  try {
    const enrollment = await findEnrollmentForUser(req.params.enrollmentId, req.user._id);
    const amount = Number(enrollment.course?.price || 500);
    const currency = enrollment.course?.currency || "INR";
    const razorpay = getRazorpayClient();

    if (!razorpay) {
      const payment = await Payment.create({
        enrollment: enrollment._id,
        amount,
        currency,
        status: "created",
        metadata: {
          mode: "manual-test"
        }
      });

      res.status(201).json({
        payment,
        order: null,
        provider: "manual-test",
        amount,
        currency
      });
      return;
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: `enrollment_${enrollment._id}`,
      notes: {
        enrollmentId: enrollment._id.toString(),
        courseId: enrollment.course?._id?.toString() || ""
      }
    });

    const payment = await Payment.create({
      enrollment: enrollment._id,
      amount,
      currency,
      providerOrderId: order.id,
      status: "created",
      metadata: order
    });

    res.status(201).json({
      payment,
      order,
      provider: "razorpay",
      amount,
      currency,
      keyId: readEnv("RAZORPAY_KEY_ID")
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPaymentAndActivate = async (req, res, next) => {
  try {
    const enrollment = await findEnrollmentForUser(req.params.enrollmentId, req.user._id);
    const payment = await Payment.findOne({ enrollment: enrollment._id }).sort({ createdAt: -1 });

    if (!payment) {
      const error = new Error("Payment record not found");
      error.statusCode = 404;
      throw error;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, manualSuccess } = req.body;
    const razorpaySecret = readEnv("RAZORPAY_KEY_SECRET");
    const hasRazorpayKeys = Boolean(readEnv("RAZORPAY_KEY_ID") && razorpaySecret);

    if (hasRazorpayKeys) {
      const generatedSignature = crypto
        .createHmac("sha256", razorpaySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        payment.status = "failed";
        payment.metadata = {
          ...payment.metadata,
          verificationFailed: true
        };
        await payment.save();

        const error = new Error("Payment verification failed");
        error.statusCode = 400;
        throw error;
      }

      payment.providerOrderId = razorpay_order_id || payment.providerOrderId;
      payment.providerPaymentId = razorpay_payment_id || payment.providerPaymentId;
      payment.status = "paid";
      payment.metadata = {
        ...payment.metadata,
        verified: true
      };
    } else if (manualSuccess) {
      payment.status = "paid";
      payment.metadata = {
        ...payment.metadata,
        verified: true,
        mode: "manual-test"
      };
    } else {
      const error = new Error("Manual test payment confirmation missing");
      error.statusCode = 400;
      throw error;
    }

    await payment.save();

    enrollment.status = "active";
    enrollment.activatedAt = new Date();
    await enrollment.save();

    res.json({
      payment,
      enrollment
    });
  } catch (error) {
    next(error);
  }
};
