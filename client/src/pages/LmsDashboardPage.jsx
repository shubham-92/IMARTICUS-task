import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LessonSidebar } from "../components/LessonSidebar.jsx";
import { LessonViewer } from "../components/LessonViewer.jsx";
import { apiGet, apiPost } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const findFirstLesson = (course) => {
  const firstModule = course?.modules?.[0];
  const firstLesson = firstModule?.lessons?.[0];
  return firstLesson ? { moduleId: firstModule._id, lessonId: firstLesson._id } : null;
};

export const LmsDashboardPage = () => {
  const navigate = useNavigate();
  const { slug = "school-of-finance-business-ug" } = useParams();
  const { user, logout } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [accessState, setAccessState] = useState("");
  const [selection, setSelection] = useState({ moduleId: "", lessonId: "" });
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [pageStatus, setPageStatus] = useState("Loading your course...");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState({ enabled: false, keyId: "" });

  const loadCourseAccess = () => {
    apiGet(`/enrollments/course/${slug}`)
      .then((data) => {
        setCourse(data.course);
        setEnrollment(data.enrollment);
        setAccessState(data.accessState);
        setPaymentStatus("");
        const firstLesson = findFirstLesson(data.course);
        if (firstLesson) {
          setSelection(firstLesson);
        }
        setPageStatus("");
      })
      .catch((error) => {
        setPageStatus(error.message);
      });
  };

  useEffect(() => {
    loadCourseAccess();
    apiGet("/payments/config")
      .then((data) => setPaymentConfig(data))
      .catch(() => setPaymentConfig({ enabled: false, keyId: "" }));
  }, []);

  const selectedLesson =
    course?.modules
      ?.find((module) => module._id === selection.moduleId)
      ?.lessons?.find((lesson) => lesson._id === selection.lessonId) || null;

  const handleSummarise = async () => {
    if (!selectedLesson || !course) {
      return;
    }

    setSummaryLoading(true);
    try {
      const data = await apiPost("/summaries/lesson-document", {
        courseId: course._id,
        lessonId: selectedLesson._id
      });
      setSummary(data.summary);
    } catch (error) {
      setSummary(error.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  const verifyManualPayment = async () => {
    if (!enrollment?._id) {
      return;
    }

    setPaymentLoading(true);
    setPaymentStatus("Activating test payment...");
    try {
      await apiPost(`/payments/enrollments/${enrollment._id}/verify`, {
        manualSuccess: true
      });
      setPaymentStatus("Test payment completed. Your course access is now active.");
      loadCourseAccess();
    } catch (error) {
      setPaymentStatus(error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const openRazorpayCheckout = async (orderData) => {
    const scriptAlreadyLoaded = Boolean(window.Razorpay);

    if (!scriptAlreadyLoaded) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = resolve;
        script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
        document.body.appendChild(script);
      });
    }

    await new Promise((resolve, reject) => {
      const razorpay = new window.Razorpay({
        key: paymentConfig.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Imarticus LMS",
        description: course?.title || "Course payment",
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            await apiPost(`/payments/enrollments/${enrollment._id}/verify`, response);
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        prefill: {
          name: user ? `${user.firstName} ${user.lastName}`.trim() : "",
          email: user?.email || ""
        },
        theme: {
          color: "#c1321f"
        }
      });

      razorpay.on("payment.failed", (event) => {
        reject(new Error(event.error.description || "Payment failed"));
      });

      razorpay.open();
    });
  };

  const handlePayNow = async () => {
    if (!enrollment?._id) {
      return;
    }

    setPaymentLoading(true);
    setPaymentStatus("Creating payment order...");

    try {
      const orderData = await apiPost(`/payments/enrollments/${enrollment._id}/order`, {});

      if (orderData.provider === "manual-test") {
        setPaymentStatus(
          "Razorpay keys are not configured yet. Using manual test mode; click the button below to simulate a successful payment."
        );
      } else {
        setPaymentStatus("Opening Razorpay checkout...");
        await openRazorpayCheckout(orderData);
        setPaymentStatus("Payment successful. Your course access is now active.");
        loadCourseAccess();
      }
    } catch (error) {
      setPaymentStatus(error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <main className="lms-shell">
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
        <div>
          <div className="fw-bold">Learner LMS</div>
          <div className="small text-secondary">
            {user ? `${user.firstName} ${user.lastName}`.trim() : "Learner"}
            {accessState ? ` | Access: ${accessState}` : ""}
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-dark btn-sm" to={`/courses/${slug}`}>
            Course Page
          </Link>
          <button
            className="btn btn-dark btn-sm"
            type="button"
            onClick={() => {
              logout();
              navigate(`/courses/${slug}`);
            }}
          >
            Logout
          </button>
        </div>
      </div>
      {pageStatus ? (
        <div className="container py-5">
          <div className="payment-gate-card">
            <h2 className="fw-bold mb-3">Access not available yet</h2>
            <p className="text-secondary mb-3">{pageStatus}</p>
            <div className="d-flex flex-wrap gap-3">
              <Link className="btn btn-danger" to={`/courses/${slug}`}>
                Go to Course Page
              </Link>
              <button
                className="btn btn-outline-dark"
                type="button"
                onClick={() => {
                  logout();
                  navigate("/auth");
                }}
              >
                Login with another account
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {!pageStatus && accessState === "pending_payment" ? (
        <div className="container py-4">
          <div className="payment-gate-card">
            <span className="eyebrow">Payment Required</span>
            <h2 className="fw-bold mt-3">Complete the test payment to unlock this course</h2>
            <p className="text-secondary mb-3">
              The learner account exists, but this enrollment is still waiting for payment
              activation. Course fee: <strong>Rs. {course?.price || 500}</strong>
            </p>
            <div className={`alert ${paymentConfig.enabled ? "alert-success" : "alert-warning"} mb-3`}>
              {paymentConfig.enabled
                ? "Razorpay test mode is configured. Clicking the button below will open the real Razorpay test checkout."
                : "Razorpay is not configured yet in the backend. The page is currently using manual test mode."}
            </div>
            <div className="d-flex flex-wrap gap-3">
              <button className="btn btn-danger" type="button" onClick={handlePayNow} disabled={paymentLoading}>
                {paymentLoading ? "Processing..." : paymentConfig.enabled ? "Open Razorpay Test Checkout" : "Start Manual Test Payment"}
              </button>
              {!paymentConfig.enabled ? (
                <button className="btn btn-outline-dark" type="button" onClick={verifyManualPayment} disabled={paymentLoading}>
                  Confirm Manual Test Payment
                </button>
              ) : null}
            </div>
            {paymentStatus ? <div className="alert alert-secondary mt-3 mb-0">{paymentStatus}</div> : null}
            <div className="small text-secondary mt-3">
              If you recently added Razorpay keys, restart the backend server once so the new env values are loaded.
            </div>
          </div>
        </div>
      ) : null}
      <div className="container-fluid">
        <div className={`row g-0 ${pageStatus || accessState !== "active" ? "d-none" : ""}`}>
          <div className="col-lg-3">
            {course ? (
              <LessonSidebar
                course={course}
                selectedLessonId={selection.lessonId}
                onSelectLesson={(moduleId, lessonId) => {
                  setSelection({ moduleId, lessonId });
                  setSummary("");
                }}
              />
            ) : null}
          </div>
          <div className="col-lg-9">
            <LessonViewer
              lesson={selectedLesson}
              onSummarise={handleSummarise}
              summary={summary}
              summaryLoading={summaryLoading}
            />
          </div>
        </div>
      </div>
    </main>
  );
};
