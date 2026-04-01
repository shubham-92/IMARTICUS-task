import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export const MyCoursesPage = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [status, setStatus] = useState("Loading your enrolled courses...");

  useEffect(() => {
    apiGet("/enrollments/me")
      .then((data) => {
        setEnrollments(data);
        setStatus("");
      })
      .catch((error) => {
        setStatus(error.message);
      });
  }, []);

  return (
    <main className="min-vh-100 bg-light">
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <span className="eyebrow">Learner Dashboard</span>
            <h1 className="fw-bold mt-3 mb-0">
              My Courses{" "}
              {user && (
                <span className="text-secondary">
                  - Welcome, {user.firstName}!
                </span>
              )}
            </h1>
          </div>
          <Link className="btn btn-outline-dark" to="/">
            Back to Home
          </Link>
        </div>

        {status ? (
          <div className="application-card">{status}</div>
        ) : enrollments.length ? (
          <div className="row g-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment._id} className="col-md-6 col-xl-4">
                <div className="replica-feature-card h-100">
                  <div className="small text-uppercase text-secondary fw-semibold">
                    {enrollment.course?.category || "Course"}
                  </div>
                  <h2 className="h4 fw-bold mt-2">
                    {enrollment.course?.title}
                  </h2>
                  <p className="text-secondary">
                    {enrollment.course?.shortDescription ||
                      "No description available."}
                  </p>
                  <div className="badge text-bg-light mb-3">
                    Status: {enrollment.status}
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <Link
                      className="btn btn-danger"
                      to={`/courses/${enrollment.course?.slug}`}
                    >
                      View Course Page
                    </Link>
                    <Link
                      className="btn btn-outline-dark"
                      to={`/lms/${enrollment.course?.slug}`}
                    >
                      Open LMS
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="application-card">
            You are not enrolled in any courses yet. Visit a course page and
            apply to get started.
          </div>
        )}
      </div>
    </main>
  );
};
