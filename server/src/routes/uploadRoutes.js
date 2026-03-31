import { Router } from "express";
import multer from "multer";
import { uploadAsset } from "../controllers/uploadController.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

export const router = Router();

router.post("/asset", upload.single("file"), uploadAsset);
