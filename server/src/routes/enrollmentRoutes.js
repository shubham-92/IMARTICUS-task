import { Router } from "express";
import {
  activateEnrollment,
  getEnrolledCourseBySlug,
  getMyEnrollments
} from "../controllers/enrollmentController.js";
import { protect } from "../middleware/authMiddleware.js";

export const router = Router();

router.get("/me", protect, getMyEnrollments);
router.get("/course/:slug", protect, getEnrolledCourseBySlug);
router.post("/:enrollmentId/activate", protect, activateEnrollment);
