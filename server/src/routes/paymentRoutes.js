import { Router } from "express";
import {
  createPaymentOrder,
  getPaymentConfig,
  verifyPaymentAndActivate
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

export const router = Router();

router.get("/config", getPaymentConfig);
router.post("/enrollments/:enrollmentId/order", protect, createPaymentOrder);
router.post("/enrollments/:enrollmentId/verify", protect, verifyPaymentAndActivate);
