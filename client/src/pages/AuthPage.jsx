import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiGet } from "../lib/api.js";

const signupState = {
  firstName: "",
  lastName: "",
  email: "",
  password: ""
};

const loginState = {
  email: "",
  password: ""
};

export const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(loginState);
  const [signupForm, setSignupForm] = useState(signupState);
  const [status, setStatus] = useState("");

  const redirectTo =
    searchParams.get("redirectTo") || location.state?.redirectTo || "/my-courses";

  const handleLogin = async (event) => {
    event.preventDefault();
    setStatus("Signing in...");

    try {
      await login(loginForm);
      const enrollments = await apiGet("/enrollments/me").catch(() => []);
      const nextPath = Array.isArray(enrollments) && enrollments.length ? "/my-courses" : redirectTo;
      navigate(nextPath, { replace: true });
    } catch (error) {
      setStatus(error.message);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setStatus("Creating account...");

    try {
      await register(signupForm);
      navigate("/my-courses", { replace: true });
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <main className="min-vh-100 d-flex align-items-center">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="application-card">
              <div className="d-flex gap-2 mb-4">
                <button
                  className={`btn ${mode === "login" ? "btn-dark" : "btn-outline-dark"}`}
                  type="button"
                  onClick={() => setMode("login")}
                >
                  Login
                </button>
                <button
                  className={`btn ${mode === "signup" ? "btn-dark" : "btn-outline-dark"}`}
                  type="button"
                  onClick={() => setMode("signup")}
                >
                  Sign Up
                </button>
              </div>

              {mode === "login" ? (
                <form className="row g-3" onSubmit={handleLogin}>
                  <div className="col-12">
                    <input className="form-control" type="email" placeholder="Email" value={loginForm.email} onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))} required />
                  </div>
                  <div className="col-12">
                    <input className="form-control" type="password" placeholder="Password" value={loginForm.password} onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))} required />
                  </div>
                  <div className="col-12">
                    <button className="btn btn-danger w-100" type="submit">
                      Login
                    </button>
                  </div>
                </form>
              ) : (
                <form className="row g-3" onSubmit={handleRegister}>
                  <div className="col-md-6">
                    <input className="form-control" placeholder="First name" value={signupForm.firstName} onChange={(event) => setSignupForm((current) => ({ ...current, firstName: event.target.value }))} required />
                  </div>
                  <div className="col-md-6">
                    <input className="form-control" placeholder="Last name" value={signupForm.lastName} onChange={(event) => setSignupForm((current) => ({ ...current, lastName: event.target.value }))} />
                  </div>
                  <div className="col-12">
                    <input className="form-control" type="email" placeholder="Email" value={signupForm.email} onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))} required />
                  </div>
                  <div className="col-12">
                    <input className="form-control" type="password" placeholder="Password" value={signupForm.password} onChange={(event) => setSignupForm((current) => ({ ...current, password: event.target.value }))} required />
                  </div>
                  <div className="col-12">
                    <button className="btn btn-danger w-100" type="submit">
                      Create Account
                    </button>
                  </div>
                </form>
              )}

              {status ? <div className="alert alert-secondary mt-3 mb-0">{status}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
