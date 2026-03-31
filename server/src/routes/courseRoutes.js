import { Router } from "express";
import {
  createApplication,
  getCourseBySlug,
  getPublishedCourses,
  seedDemoCourse
} from "../controllers/courseController.js";

export const router = Router();

router.get("/", getPublishedCourses);
router.get("/slug/:slug", getCourseBySlug);
router.post("/apply", createApplication);
router.post("/seed-demo", seedDemoCourse);
