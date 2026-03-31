import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ApplicationForm } from "../components/ApplicationForm.jsx";
import { apiGet } from "../lib/api.js";
import {
  advisoryLeaders,
  campusEvents,
  edgeCards,
  faqItems,
  journeyCards,
  lifeAtCampus,
  newsItems,
  outcomeTracks,
  placementHighlights,
  realPillars,
  skillCouncil
} from "../data/imarticusReplicaContent.js";

export const CourseLandingPage = () => {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet(`/courses/slug/${slug}`)
      .then(setCourse)
      .catch((loadError) => setError(loadError.message));
  }, [slug]);

  if (error) {
    return <div className="container py-5">Failed to load course: {error}</div>;
  }

  if (!course) {
    return <div className="container py-5">Loading course...</div>;
  }

  return (
    <main className="landing-page replica-page">
      <header className="replica-nav">
        <div className="container">
          <div className="replica-nav-inner">
            <div className="replica-brand">ISFB</div>
            <div className="replica-nav-links">
              <a href="#application-form">Apply Now</a>
              <Link to={`/lms/${course.slug}`}>Learner LMS</Link>
              <Link to="/admin">Admin</Link>
            </div>
          </div>
        </div>
      </header>
      <section className="replica-hero">
        <div className="container py-5">
          <div className="row g-4 align-items-start">
            <div className="col-xl-7">
              <div className="hero-copy">
                <div className="eyebrow">India's only</div>
                <h1 className="replica-title mt-3">
                  UG Program in Finance and Business that gets you real-world ready
                </h1>
                <p className="replica-subtitle">
                  A premium undergraduate journey in finance and business with experiential learning,
                  market-facing exposure, and an application flow that continues directly into the LMS.
                </p>

                <div className="deadline-card mt-4">
                  <div className="small text-uppercase fw-semibold text-secondary">
                    Round 3 application deadline
                  </div>
                  <div className="fs-4 fw-bold">30 April 2026</div>
                </div>

                <div className="hero-actions mt-4">
                  <a className="btn btn-danger btn-lg" href="#application-form">
                    Start Your Journey
                  </a>
                  <a
                    className={`btn btn-outline-dark btn-lg ${course.brochureUrl ? "" : "disabled"}`}
                    href={course.brochureUrl || "#application-form"}
                    target={course.brochureUrl ? "_blank" : undefined}
                    rel={course.brochureUrl ? "noreferrer" : undefined}
                  >
                    Download Brochure
                  </a>
                </div>

                <div className="row g-3 mt-3">
                  <div className="col-sm-6 col-lg-4">
                    <div className="replica-stat-card">
                      <div className="stat-icon">01</div>
                      <div className="replica-stat-title">3-Year Full-Time</div>
                      <div className="replica-stat-copy">UG journey with optional residential experience</div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="replica-stat-card">
                      <div className="stat-icon">02</div>
                      <div className="replica-stat-title">BBA Degree</div>
                      <div className="replica-stat-copy">Parallel academic degree positioning</div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="replica-stat-card">
                      <div className="stat-icon">03</div>
                      <div className="replica-stat-title">ACCA + CFA Lens</div>
                      <div className="replica-stat-copy">Integrated finance and business orientation</div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-6">
                    <div className="replica-stat-card">
                      <div className="stat-icon">04</div>
                      <div className="replica-stat-title">Immersions</div>
                      <div className="replica-stat-copy">IIM exposure, Singapore context, and applied India mission</div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-6">
                    <div className="replica-stat-card">
                      <div className="stat-icon">05</div>
                      <div className="replica-stat-title">Location</div>
                      <div className="replica-stat-copy">Powai, Mumbai in India’s financial hub</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-5">
              <div className="hero-form-wrap">
                <ApplicationForm courseId={course._id} courseSlug={course.slug} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 replica-section-light">
        <div className="container">
          <div className="section-heading text-center mx-auto">
            <span className="eyebrow">You graduate with the edge</span>
            <h2 className="fw-bold mt-3">You graduate with the ISFB edge</h2>
            <p className="text-secondary mb-0">
              The learning journey is framed around the same high-exposure, high-credibility tenets
              that shape the original ISFB page.
            </p>
          </div>

          <div className="row g-4 mt-2">
            {edgeCards.map((card) => (
              <div key={card.title} className="col-md-6 col-xl-3">
                <div className="replica-feature-card h-100">
                  <h3 className="h5 fw-bold">{card.title}</h3>
                  <p className="text-secondary mb-0">{card.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row align-items-end g-4">
            <div className="col-lg-6">
              <span className="eyebrow">Backed by leaders</span>
              <h2 className="fw-bold mt-3 mb-2">Backed by leaders that move real markets</h2>
            </div>
            <div className="col-lg-6">
              <p className="text-secondary mb-0">
                The reference page leans heavily on credibility through industry figures, so this
                section mirrors that advisory-board style with prominent leader cards and
                category-led framing.
              </p>
            </div>
          </div>

          <div className="leader-categories mt-4">
            <div className="leader-category-chip active">Domain Visionaries in Finance, Investment & Capital Markets</div>
            <div className="leader-category-chip">Academic Leaders, Policy Experts & Ecosystem Builders</div>
            <div className="leader-category-chip">AI, Fintech, Data Science & New-Age Finance</div>
          </div>

          <div className="row g-4 mt-2">
            {advisoryLeaders.map((leader) => (
              <div key={leader.name} className="col-md-6 col-xl-4">
                <div className="leader-card h-100">
                  <div className="leader-avatar">{leader.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <h3 className="h5 fw-bold mb-1">{leader.name}</h3>
                    <div className="text-secondary small">{leader.role}</div>
                    <div className="leader-org mt-3">{leader.org}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="news-strip">
        <div className="container">
          <div className="news-strip-inner">
            {newsItems.map((item) => (
              <div key={item} className="news-pill">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 replica-section-dark">
        <div className="container">
          <div className="section-heading section-heading-dark text-center mx-auto">
            <span className="eyebrow eyebrow-dark">Outcomes</span>
            <h2 className="fw-bold mt-3">50,000+ placements in Fortune 500 companies</h2>
            <p className="mb-0 text-light-emphasis">
              Strong outcome visibility is a major part of the reference experience, so this section
              leans into market proof and post-program trajectories.
            </p>
          </div>

          <div className="row g-3 mt-2">
            {placementHighlights.map((item) => (
              <div key={item.company} className="col-6 col-lg">
                <div className="placement-card h-100">
                  <div className="placement-company">{item.company}</div>
                  <div className="placement-value">{item.placements}</div>
                  <div className="placement-copy">placements</div>
                </div>
              </div>
            ))}
          </div>

          <div className="placements-caption mt-4">
            50,000+ placements in Fortune 500 companies across consulting, banking, global finance, and business operations pathways.
          </div>

          <div className="row g-4 mt-3">
            {outcomeTracks.map((track) => (
              <div key={track.title} className="col-lg-4">
                <div className="outcome-track-card h-100">
                  <div className="h4 fw-bold">{track.title}</div>
                  <div className="text-secondary mb-3">{track.subtitle}</div>
                  {track.points.map((point) => (
                    <div key={point} className="track-point">
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="section-heading mx-auto text-center">
            <span className="eyebrow">R.E.A.L.</span>
            <h2 className="fw-bold mt-3">At ISFB, finance education gets R-E-A-L</h2>
            <p className="text-secondary mb-0">
              The pedagogy is designed to collapse the distance between classroom concepts and
              boardroom decisions.
            </p>
          </div>

          <div className="row g-4 mt-2">
            {realPillars.map((pillar) => (
              <div key={pillar.letter} className="col-md-6 col-xl-3">
                <div className="real-card h-100">
                  <div className="real-letter">{pillar.letter}</div>
                  <h3 className="h5 fw-bold mt-3">{pillar.title}</h3>
                  <p className="text-secondary mb-0">{pillar.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 replica-section-light">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-5">
              <span className="eyebrow">Experiential journey</span>
              <h2 className="fw-bold mt-3">A 3-year journey with more than classroom learning</h2>
              <p className="text-secondary">
                The program narrative is shaped around reflection, immersion, applied learning, and
                personal growth rather than a flat brochure summary.
              </p>
            </div>
            <div className="col-lg-7">
              <div className="row g-3">
                {journeyCards.map((card, index) => (
                  <div key={card.title} className="col-md-6">
                    <div className="journey-card h-100">
                      <div className="journey-number">0{index + 1}</div>
                      <h3 className="h5 fw-bold">{card.title}</h3>
                      <p className="text-secondary mb-0">{card.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-5">
              <span className="eyebrow">Finance skill council</span>
              <h2 className="fw-bold mt-3">Benchmarked against institutions shaping the finance industry</h2>
            </div>
            <div className="col-lg-7">
              <div className="council-grid">
                {skillCouncil.map((item) => (
                  <div key={item} className="council-chip">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 replica-section-light">
        <div className="container">
          <div className="row g-4 align-items-start">
            <div className="col-lg-5">
              <span className="eyebrow">Life @ campus</span>
              <h2 className="fw-bold mt-3">An experience designed to shape the person behind the professional</h2>
            </div>
            <div className="col-lg-7">
              <div className="row g-3">
                {lifeAtCampus.map((item) => (
                  <div key={item} className="col-md-6">
                    <div className="campus-card">{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="row g-4 mt-3">
            {campusEvents.map((item) => (
              <div key={item.title} className="col-md-6 col-xl-3">
                <div className="replica-feature-card h-100">
                  <h3 className="h5 fw-bold">{item.title}</h3>
                  <p className="text-secondary mb-0">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="section-heading mx-auto text-center">
            <span className="eyebrow">FAQ</span>
            <h2 className="fw-bold mt-3">Common questions about the journey and access flow</h2>
          </div>

          <div className="faq-stack mt-4">
            {faqItems.map((item) => (
              <details key={item.question} className="faq-card" open={item.question === faqItems[0].question}>
                <summary>{item.question}</summary>
                <p className="text-secondary mb-0 mt-3">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
