import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["video", "document", "quiz", "assignment"],
      default: "video"
    },
    sourceType: {
      type: String,
      enum: ["youtube", "vimeo", "cloudinary", "upload", "richtext", "external"],
      default: "youtube"
    },
    videoUrl: { type: String, default: "" },
    assetPublicId: { type: String, default: "" },
    assetUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    durationInMinutes: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    isPreview: { type: Boolean, default: false },
    extractedText: { type: String, default: "" },
    summaryCache: { type: String, default: "" }
  },
  { _id: true }
);

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
    lessons: { type: [lessonSchema], default: [] }
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    shortDescription: { type: String, default: "" },
    heroDescription: { type: String, default: "" },
    price: { type: Number, default: 500 },
    currency: { type: String, default: "INR" },
    thumbnailUrl: { type: String, default: "" },
    brochureUrl: { type: String, default: "" },
    category: { type: String, default: "Undergraduate Program" },
    durationLabel: { type: String, default: "" },
    modeLabel: { type: String, default: "" },
    eligibilityLabel: { type: String, default: "" },
    isPublished: { type: Boolean, default: false },
    modules: { type: [moduleSchema], default: [] },
    highlights: { type: [String], default: [] },
    outcomes: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
