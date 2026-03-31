import fs from "fs/promises";
import path from "path";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";

const uploadsRoot = path.resolve(process.cwd(), "server", "uploads");

const inferResourceType = (mimetype) => {
  if (mimetype?.startsWith("video/")) {
    return "video";
  }

  if (mimetype?.startsWith("image/")) {
    return "image";
  }

  return "raw";
};

const uploadToCloudinary = async (file, folder) =>
  new Promise((resolve, reject) => {
    const resourceType = inferResourceType(file.mimetype);
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename: true
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          storage: "cloudinary",
          url: result.secure_url,
          publicId: result.public_id,
          originalFilename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          resourceType
        });
      }
    );

    stream.end(file.buffer);
  });

const sanitizeFilename = (filename) =>
  filename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");

const saveLocally = async (file, folder, serverUrl) => {
  const targetDir = path.join(uploadsRoot, folder);
  await fs.mkdir(targetDir, { recursive: true });

  const filename = `${Date.now()}-${sanitizeFilename(file.originalname)}`;
  const absolutePath = path.join(targetDir, filename);
  await fs.writeFile(absolutePath, file.buffer);

  return {
    storage: "local",
    url: `${serverUrl}/uploads/${folder}/${filename}`,
    publicId: `${folder}/${filename}`,
    originalFilename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    resourceType: inferResourceType(file.mimetype)
  };
};

export const storeUploadedFile = async ({ file, folder, serverUrl }) => {
  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(file, folder);
  }

  return saveLocally(file, folder, serverUrl);
};
