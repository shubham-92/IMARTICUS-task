import { Router } from "express";
import { summariseLessonDocument } from "../controllers/summaryController.js";

export const router = Router();

router.post("/lesson-document", summariseLessonDocument);
