import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
};

type JwtPayload = {
  exp: number;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {

    const decoded = jwtDecode<JwtPayload>(token);

    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      localStorage.removeItem("token");
      return <Navigate to="/login" />;
    }

  } catch (error) {
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;