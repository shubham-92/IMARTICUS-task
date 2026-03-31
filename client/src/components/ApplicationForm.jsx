import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  highestQualification: "",
  password: ""
};

export const ApplicationForm = ({ courseId, courseSlug }) => {
  const navigate = useNavigate();
  const { setAuthFromApplication } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "loading", message: "Submitting application..." });

    try {
      const data = await apiPost("/courses/apply", {
        ...formData,
        courseId,
        createAccount: true
      });
      if (data.auth) {
        setAuthFromApplication(data.auth);
      }
      setStatus({
        type: "success",
        message: "Application submitted and learner account created. You can now continue into the LMS."
      });
      setFormData(initialState);
      window.setTimeout(() => {
        navigate(`/lms/${courseSlug}`);
      }, 800);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="application-card application-form-shell" id="application-form">
      <div className="application-form-top">
        <div className="small text-uppercase fw-semibold text-secondary">Admissions open</div>
        <h3 className="fw-bold mb-2 mt-2">Start Your Journey in Finance & Business</h3>
        <p className="text-secondary mb-2">
          Fill in your details below and our admissions team will guide you through the next steps.
        </p>
        <div className="small text-secondary">
          Already registered? <Link className="application-link" to={`/auth?redirectTo=/courses/${courseSlug}`}>Login here</Link>
        </div>
      </div>
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-6">
          <input className="form-control" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <input className="form-control" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <input className="form-control" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <input className="form-control" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <input className="form-control" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <input className="form-control" name="highestQualification" placeholder="Highest qualification" value={formData.highestQualification} onChange={handleChange} />
        </div>
        <div className="col-12">
          <input className="form-control" type="password" name="password" placeholder="Create password for learner account" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="col-12">
          <button className="btn btn-dark btn-lg w-100" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
      <div className="small text-secondary mt-3">
        By submitting the form, I have read and agree to the terms and understand that this
        journey continues through the LMS access flow after payment.
      </div>
      {status.message ? <div className={`alert mt-3 ${status.type === "success" ? "alert-success" : status.type === "error" ? "alert-danger" : "alert-secondary"}`}>{status.message}</div> : null}
    </div>
  );
};
