import { Application } from "../models/Application.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

const buildDemoCoursePayload = () => ({
  title: "School of Finance and Business UG Program",
  slug: "school-of-finance-business-ug",
  shortDescription: "A reusable flagship undergraduate-style course journey inspired by the Imarticus experience.",
  heroDescription:
    "Industry-aligned undergraduate journey with immersive modules, career support, documents, and guided video learning.",
  price: 500,
  durationLabel: "36 Months",
  modeLabel: "On Campus + Experiential",
  eligibilityLabel: "12th Pass / Equivalent",
  isPublished: true,
  highlights: [
    "Industry-ready curriculum",
    "Capstone-led learning",
    "Career services support",
    "Finance and business focus"
  ],
  outcomes: [
    "Understand business fundamentals",
    "Build finance domain fluency",
    "Access structured LMS lessons",
    "Use AI to summarise uploaded documents"
  ],
  modules: [
    {
      title: "Getting Started",
      description: "Orientation and foundation lessons.",
      order: 1,
      lessons: [
        {
          title: "Welcome to the program",
          slug: "welcome-to-the-program",
          type: "video",
          sourceType: "youtube",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          durationInMinutes: 8,
          order: 1,
          isPreview: true,
          description: "Introductory walkthrough of the LMS and learner journey."
        },
        {
          title: "Program handbook",
          slug: "program-handbook",
          type: "document",
          sourceType: "upload",
          assetUrl: "",
          extractedText:
            "This handbook introduces the curriculum structure, assessments, and support resources available to learners. It explains how modules are organised, what learners can expect from each lesson, and where to find academic and career support.",
          order: 2,
          description: "Learner guide for program expectations and support."
        }
      ]
    }
  ]
});

export const getPublishedCourses = async (_req, res, next) => {
  try {
    const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

export const getCourseBySlug = async (req, res, next) => {
  try {
    let course = await Course.findOne({ slug: req.params.slug, isPublished: true });
    if (!course && req.params.slug === "school-of-finance-business-ug") {
      course = await Course.create(buildDemoCoursePayload());
    }

    if (!course) {
      const error = new Error("Course not found");
      error.statusCode = 404;
      throw error;
    }

    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req, res, next) => {
  try {
    const {
      courseId,
      firstName,
      lastName,
      email,
      phone,
      city,
      highestQualification,
      createAccount,
      password
    } = req.body;

    const application = await Application.create({
      course: courseId,
      firstName,
      lastName,
      email,
      phone,
      city,
      highestQualification
    });

    let auth = null;

    if (createAccount && password) {
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          firstName,
          lastName,
          email,
          password,
          phone,
          role: "learner"
        });
      }

      const enrollment = await Enrollment.findOneAndUpdate(
        {
          user: user._id,
          course: courseId
        },
        {
          $setOnInsert: {
            application: application._id,
            status: "pending_payment"
          }
        },
        {
          upsert: true,
          new: true
        }
      );

      auth = {
        token: generateToken({ userId: user._id, role: user.role }),
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        enrollmentId: enrollment._id
      };
    }

    res.status(201).json({
      message: "Application submitted successfully",
      application,
      auth
    });
  } catch (error) {
    next(error);
  }
};

export const seedDemoCourse = async (_req, res, next) => {
  try {
    const existingCourse = await Course.findOne({ slug: "school-of-finance-business-ug" });
    if (existingCourse) {
      res.json(existingCourse);
      return;
    }

    const course = await Course.create(buildDemoCoursePayload());

    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};
