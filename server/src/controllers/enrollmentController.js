import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";

export const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate("course")
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    next(error);
  }
};

export const getEnrolledCourseBySlug = async (req, res, next) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug });
    if (!course) {
      const error = new Error("Course not found");
      error.statusCode = 404;
      throw error;
    }

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
      status: { $in: ["pending_payment", "active"] }
    });

    if (!enrollment) {
      const error = new Error("You do not have access to this course yet");
      error.statusCode = 403;
      throw error;
    }

    res.json({
      enrollment,
      course,
      accessState: enrollment.status
    });
  } catch (error) {
    next(error);
  }
};

export const activateEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      _id: req.params.enrollmentId,
      user: req.user._id
    }).populate("course");

    if (!enrollment) {
      const error = new Error("Enrollment not found");
      error.statusCode = 404;
      throw error;
    }

    enrollment.status = "active";
    enrollment.activatedAt = new Date();
    await enrollment.save();

    res.json(enrollment);
  } catch (error) {
    next(error);
  }
};
