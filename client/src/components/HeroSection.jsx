export const HeroSection = ({ course }) => (
  <section className="hero-section">
    <div className="container py-5">
      <div className="row align-items-center g-4">
        <div className="col-lg-7">
          <span className="eyebrow">{course.category}</span>
          <h1 className="display-4 fw-bold mt-3">{course.title}</h1>
          <p className="lead mt-3 text-secondary">{course.heroDescription}</p>
          <div className="d-flex flex-wrap gap-3 mt-4">
            <div className="stat-pill">{course.durationLabel}</div>
            <div className="stat-pill">{course.modeLabel}</div>
            <div className="stat-pill">{course.eligibilityLabel}</div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="hero-card shadow-lg">
            <div className="price-label">Application Fee</div>
            <div className="hero-price">Rs. {course.price}</div>
            <p className="text-secondary mb-4">
              Apply to unlock the course journey and continue into the learner LMS.
            </p>
            <a className="btn btn-danger btn-lg w-100" href="#application-form">
              Apply Now
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);
