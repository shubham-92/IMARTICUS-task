import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import { router as healthRouter } from "./routes/healthRoutes.js";
import { router as authRouter } from "./routes/authRoutes.js";
import { router as courseRouter } from "./routes/courseRoutes.js";
import { router as summaryRouter } from "./routes/summaryRoutes.js";
import { router as adminCourseRouter } from "./routes/adminCourseRoutes.js";
import { router as uploadRouter } from "./routes/uploadRoutes.js";
import { router as enrollmentRouter } from "./routes/enrollmentRoutes.js";
import { router as paymentRouter } from "./routes/paymentRoutes.js";
import { configureCloudinary } from "./config/cloudinary.js";

dotenv.config();
configureCloudinary();

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL || "*",
      credentials: true
    })
  );
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(path.resolve(process.cwd(), "server", "uploads")));

  app.get("/", (_req, res) => {
    res.json({
      name: "Imarticus LMS API",
      status: "ok"
    });
  });

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/courses", courseRouter);
  app.use("/api/summaries", summaryRouter);
  app.use("/api/admin", adminCourseRouter);
  app.use("/api/uploads", uploadRouter);
  app.use("/api/enrollments", enrollmentRouter);
  app.use("/api/payments", paymentRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
