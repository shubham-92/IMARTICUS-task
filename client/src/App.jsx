import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage.jsx";
import { CourseLandingPage } from "./pages/CourseLandingPage.jsx";
import { LmsDashboardPage } from "./pages/LmsDashboardPage.jsx";
import { AdminDashboardPage } from "./pages/AdminDashboardPage.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { MyCoursesPage } from "./pages/MyCoursesPage.jsx";

export const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/admin" element={<AdminDashboardPage />} />
    <Route
      path="/my-courses"
      element={
        <ProtectedRoute>
          <MyCoursesPage />
        </ProtectedRoute>
      }
    />
    <Route path="/courses/:slug" element={<CourseLandingPage />} />
    <Route
      path="/lms/:slug"
      element={
        <ProtectedRoute>
          <LmsDashboardPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/lms"
      element={
        <ProtectedRoute>
          <LmsDashboardPage />
        </ProtectedRoute>
      }
    />
  </Routes>
);
