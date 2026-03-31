import { AiSummary } from "../models/AiSummary.js";
import { Course } from "../models/Course.js";
import { summariseDocumentText } from "../services/aiSummaryService.js";

export const summariseLessonDocument = async (req, res, next) => {
  try {
    const { courseId, lessonId, userId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      const error = new Error("Course not found");
      error.statusCode = 404;
      throw error;
    }

    const lesson = course.modules
      .flatMap((module) => module.lessons)
      .find((item) => item._id.toString() === lessonId);

    if (!lesson || lesson.type !== "document") {
      const error = new Error("Document lesson not found");
      error.statusCode = 404;
      throw error;
    }

    if (lesson.summaryCache) {
      res.json({
        summary: lesson.summaryCache,
        cached: true,
        summaryId: null
      });
      return;
    }

    const summary = await summariseDocumentText(lesson.extractedText || lesson.description || "");

    lesson.summaryCache = summary;
    await course.save();

    const summaryRecord = await AiSummary.create({
      course: course._id,
      lessonId,
      user: userId || undefined,
      model: process.env.OPENAI_API_KEY
        ? process.env.OPENAI_API_KEY.startsWith("gsk_")
          ? "llama-3.1-8b-instant"
          : "gpt-4o-mini"
        : "fallback-local-summary",
      prompt: "Summarise LMS lesson document",
      summary
    }).catch(() => null);

    res.json({
      summary,
      cached: false,
      summaryId: summaryRecord?._id || null
    });
  } catch (error) {
    next(error);
  }
};
