import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    alert("נראה שלא התחברת 😊");
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
