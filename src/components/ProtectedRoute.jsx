import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Route cần đăng nhập, có thể check thêm role. Lấy role thống nhất với AuthContext/header.
export default function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const role = user?.role ?? user?.userRole ?? user?.user_role ?? "MEMBER";

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
