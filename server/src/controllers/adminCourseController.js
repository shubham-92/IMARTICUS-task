import { Course } from "../models/Course.js";
import { slugify } from "../utils/slugify.js";

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => item.toString().trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const findCourseOrThrow = async (courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  return course;
};

export const getAdminCourses = async (_req, res, next) => {
  try {
    const courses = await Course.find().sort({ updatedAt: -1 });
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const title = req.body.title?.trim();
    if (!title) {
      const error = new Error("Course title is required");
      error.statusCode = 400;
      throw error;
    }

    const slug = req.body.slug?.trim() || slugify(title);

    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      const error = new Error("A course with this slug already exists");
      error.statusCode = 409;
      throw error;
    }

    const course = await Course.create({
      title,
      slug,
      shortDescription: req.body.shortDescription || "",
      heroDescription: req.body.heroDescription || "",
      price: Number(req.body.price || 500),
      currency: req.body.currency || "INR",
      thumbnailUrl: req.body.thumbnailUrl || "",
      brochureUrl: req.body.brochureUrl || "",
      category: req.body.category || "Undergraduate Program",
      durationLabel: req.body.durationLabel || "",
      modeLabel: req.body.modeLabel || "",
      eligibilityLabel: req.body.eligibilityLabel || "",
      isPublished: Boolean(req.body.isPublished),
      highlights: normalizeList(req.body.highlights),
      outcomes: normalizeList(req.body.outcomes),
      modules: []
    });

    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await findCourseOrThrow(req.params.courseId);

    course.title = req.body.title?.trim() || course.title;
    course.slug = req.body.slug?.trim() || course.slug;
    course.shortDescription = req.body.shortDescription ?? course.shortDescription;
    course.heroDescription = req.body.heroDescription ?? course.heroDescription;
    course.price = req.body.price !== undefined ? Number(req.body.price) : course.price;
    course.currency = req.body.currency ?? course.currency;
    course.thumbnailUrl = req.body.thumbnailUrl ?? course.thumbnailUrl;
    course.brochureUrl = req.body.brochureUrl ?? course.brochureUrl;
    course.category = req.body.category ?? course.category;
    course.durationLabel = req.body.durationLabel ?? course.durationLabel;
    course.modeLabel = req.body.modeLabel ?? course.modeLabel;
    course.eligibilityLabel = req.body.eligibilityLabel ?? course.eligibilityLabel;
    course.isPublished =
      req.body.isPublished !== undefined ? Boolean(req.body.isPublished) : course.isPublished;

    if (req.body.highlights !== undefined) {
      course.highlights = normalizeList(req.body.highlights);
    }

    if (req.body.outcomes !== undefined) {
      course.outcomes = normalizeList(req.body.outcomes);
    }

    await course.save();
    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const addModuleToCourse = async (req, res, next) => {
  try {
    const course = await findCourseOrThrow(req.params.courseId);
    const title = req.body.title?.trim();

    if (!title) {
      const error = new Error("Module title is required");
      error.statusCode = 400;
      throw error;
    }

    course.modules.push({
      title,
      description: req.body.description || "",
      order: Number(req.body.order || course.modules.length + 1),
      lessons: []
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

export const addLessonToModule = async (req, res, next) => {
  try {
    const course = await findCourseOrThrow(req.params.courseId);
    const module = course.modules.id(req.params.moduleId);

    if (!module) {
      const error = new Error("Module not found");
      error.statusCode = 404;
      throw error;
    }

    const title = req.body.title?.trim();
    if (!title) {
      const error = new Error("Lesson title is required");
      error.statusCode = 400;
      throw error;
    }

    const type = req.body.type || "video";
    const sourceType = req.body.sourceType || (type === "document" ? "upload" : "youtube");

    module.lessons.push({
      title,
      slug: req.body.slug?.trim() || slugify(title),
      type,
      sourceType,
      videoUrl: req.body.videoUrl || "",
      assetPublicId: req.body.assetPublicId || "",
      assetUrl: req.body.assetUrl || "",
      description: req.body.description || "",
      durationInMinutes: Number(req.body.durationInMinutes || 0),
      order: Number(req.body.order || module.lessons.length + 1),
      isPreview: Boolean(req.body.isPreview),
      extractedText: req.body.extractedText || "",
      summaryCache: ""
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

export const updateModule = async (req, res, next) => {
  try {
    const course = await findCourseOrThrow(req.params.courseId);
    const module = course.modules.id(req.params.moduleId);

    if (!module) {
      const error = new Error("Module not found");
      error.statusCode = 404;
      throw error;
    }

    module.title = req.body.title?.trim() || module.title;
    module.description = req.body.description ?? module.description;
    module.order = req.body.order !== undefined ? Number(req.body.order) : module.order;

    await course.save();
    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const deleteModule = async (req, res, next) => {
  try {
    const course = await findCourseOrThrow(req.params.courseId);
    const module = course.modules.id(req.params.moduleId);

    if (!module) {
      const error = new Error("Module not found");
      error.statusCode = 404;
      throw error;
    }

    course.modules.pull(req.params.moduleId);
    await course.save();
    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const updateLesson = async (req, res, next) => {
  try {
    const course = await findCourseOrThrow(req.params.courseId);
    const module = course.modules.id(req.params.moduleId);

    if (!module) {
      const error = new Error("Module not found");
      error.statusCode = 404;
      throw error;
    }

    const lesson = module.lessons.id(req.params.lessonId);
    if (!lesson) {
      const error = new Error("Lesson not found");
      error.statusCode = 404;
      throw error;
    }

    lesson.title = req.body.title?.trim() || lesson.title;
    lesson.slug = req.body.slug?.trim() || lesson.slug;
    lesson.type = req.body.type || lesson.type;
    lesson.sourceType = req.body.sourceType || lesson.sourceType;
    lesson.videoUrl = req.body.videoUrl ?? lesson.videoUrl;
    lesson.assetPublicId = req.body.assetPublicId ?? lesson.assetPublicId;
    lesson.assetUrl = req.body.assetUrl ?? lesson.assetUrl;
    lesson.description = req.body.description ?? lesson.description;
    lesson.durationInMinutes =
      req.body.durationInMinutes !== undefined
        ? Number(req.body.durationInMinutes)
        : lesson.durationInMinutes;
    lesson.order = req.body.order !== undefined ? Number(req.body.order) : lesson.order;
    lesson.isPreview =
      req.body.isPreview !== undefined ? Boolean(req.body.isPreview) : lesson.isPreview;
    lesson.extractedText = req.body.extractedText ?? lesson.extractedText;

    await course.save();
    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const deleteLesson = async (req, res, next) => {
  try {
    const course = await findCourseOrThrow(req.params.courseId);
    const module = course.modules.id(req.params.moduleId);

    if (!module) {
      const error = new Error("Module not found");
      error.statusCode = 404;
      throw error;
    }

    const lesson = module.lessons.id(req.params.lessonId);
    if (!lesson) {
      const error = new Error("Lesson not found");
      error.statusCode = 404;
      throw error;
    }

    module.lessons.pull(req.params.lessonId);
    await course.save();
    res.json(course);
  } catch (error) {
    next(error);
  }
};
