import { extractTextFromFile } from "../utils/extractTextFromFile.js";
import { storeUploadedFile } from "../services/storageService.js";

export const uploadAsset = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("No file uploaded");
      error.statusCode = 400;
      throw error;
    }

    const folder = req.body.folder || "general";
    const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get("host")}`;
    const asset = await storeUploadedFile({
      file: req.file,
      folder,
      serverUrl
    });

    const extractedText =
      req.body.extractText === "true" ? await extractTextFromFile(req.file) : "";

    res.status(201).json({
      assetUrl: asset.url,
      assetPublicId: asset.publicId,
      storage: asset.storage,
      originalFilename: asset.originalFilename,
      mimetype: asset.mimetype,
      size: asset.size,
      resourceType: asset.resourceType,
      extractedText
    });
  } catch (error) {
    next(error);
  }
};
