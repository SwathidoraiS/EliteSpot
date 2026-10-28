import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
  adminOnly?:boolean;
};

type JwtPayload = {
  exp: number;
};

/**
 * 🔐 ProtectedRoute
 * Restricts access to authenticated users with valid (non-expired) JWT
 */
function ProtectedRoute({ children, adminOnly = false, }: ProtectedRouteProps) {

  const token = localStorage.getItem("token");

  // ❌ No token → redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    // Current time in seconds
    const currentTime = Date.now() / 1000;

    // Token expired → clear storage + redirect
    if (!decoded?.exp || decoded.exp < currentTime) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userRole");

      return <Navigate to="/login" replace />;
    }

  } catch (error) {
    // Invalid token → cleanup + redirect
    console.error("Invalid token:", error);

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");

    return <Navigate to="/login" replace />;
  }
  // Admin-only route check
  if (adminOnly) {
    const userRole = localStorage.getItem("userRole");

    if (userRole?.toLowerCase() !== "admin") {
      return <Navigate to="/" replace />;
    }
  }

  // Valid token → allow access
  return <>{children}</>;
}

export default ProtectedRoute;