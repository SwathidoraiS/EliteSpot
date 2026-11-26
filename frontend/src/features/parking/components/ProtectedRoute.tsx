import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ProtectedRouteProps = {
  children: ReactNode;
  adminOnly?: boolean;
};

function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      try {
        const response = await fetch(`${BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          if (active) {
            setAuthenticated(false);
          }
          return;
        }

        const data = await response.json();

        if (!data.success || !data.user) {
          if (active) {
            setAuthenticated(false);
          }
          return;
        }

        if (active) {
          setAuthenticated(true);
          setUserRole(data.user.role);
        }

      } catch (error) {
        console.error("Session verification failed:", error);

        if (active) {
          setAuthenticated(false);
        }

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      active = false;
    };

  }, []);

  if (loading) {
    return <div>Verifying session...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    adminOnly &&
    userRole?.toLowerCase() !== "admin"
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;