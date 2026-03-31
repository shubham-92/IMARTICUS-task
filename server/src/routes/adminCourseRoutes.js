import { Router } from "express";
import {
  addLessonToModule,
  addModuleToCourse,
  createCourse,
  deleteLesson,
  deleteModule,
  getAdminCourses,
  updateLesson,
  updateModule,
  updateCourse
} from "../controllers/adminCourseController.js";

export const router = Router();

router.get("/courses", getAdminCourses);
router.post("/courses", createCourse);
router.put("/courses/:courseId", updateCourse);
router.post("/courses/:courseId/modules", addModuleToCourse);
router.put("/courses/:courseId/modules/:moduleId", updateModule);
router.delete("/courses/:courseId/modules/:moduleId", deleteModule);
router.post("/courses/:courseId/modules/:moduleId/lessons", addLessonToModule);
router.put("/courses/:courseId/modules/:moduleId/lessons/:lessonId", updateLesson);
router.delete("/courses/:courseId/modules/:moduleId/lessons/:lessonId", deleteLesson);
