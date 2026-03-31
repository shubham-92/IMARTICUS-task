import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api.js";

export const HomePage = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    apiGet("/courses")
      .then(setCourses)
      .catch(() => setCourses([]));
  }, []);

  return (
    <main className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-xl-10">
          <div className="p-5 bg-white shadow rounded-4">
            <h1 className="fw-bold">Course platform with landing page, LMS, AI summary, payment, and admin controls</h1>
            <p className="text-secondary mt-3">
              Use this home page as a quick navigation hub. Admin-created published courses will appear below so learners can register for any course you add.
            </p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <Link className="btn btn-outline-dark btn-lg" to="/admin">
                  Open Admin Workspace
                </Link>
                <Link className="btn btn-outline-dark btn-lg" to="/my-courses">
                  View My Courses
                </Link>
              </div>

              <div className="row g-4 mt-2">
                {courses.length ? (
                  courses.map((course) => (
                    <div key={course._id} className="col-md-6 col-xl-4">
                      <div className="replica-feature-card h-100">
                        <div className="small text-uppercase text-secondary fw-semibold">{course.category}</div>
                        <h3 className="h4 fw-bold mt-2">{course.title}</h3>
                        <p className="text-secondary">{course.shortDescription || course.heroDescription || "No description added yet."}</p>
                        <div className="d-flex flex-wrap gap-2 mt-3 mb-3">
                          {course.durationLabel ? <span className="badge text-bg-light">{course.durationLabel}</span> : null}
                          {course.modeLabel ? <span className="badge text-bg-light">{course.modeLabel}</span> : null}
                        </div>
                        <Link className="btn btn-danger" to={`/courses/${course.slug}`}>
                          Open Course
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="application-card">
                      No published courses yet. Create and publish one from the admin workspace.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
