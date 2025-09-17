import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    // if not logged in, go to login
    return <Navigate to="/login" replace />;
  }
  return children;
}
