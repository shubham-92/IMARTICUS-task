import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authChecked } = useAuth();
  const location = useLocation();

  if (!authChecked) {
    return <div className="container py-5">Checking access...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ redirectTo: location.pathname }} />;
  }

  return children;
};
