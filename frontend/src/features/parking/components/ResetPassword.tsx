import { useState, useEffect, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/login.css";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ResetParams = {
  token: string;
};

function ResetPassword() {
  const { token } = useParams<ResetParams>();
  const navigate = useNavigate();

  // Form state
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  //  Token validation state
  const [validToken, setValidToken] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");

  //  Verify reset token
  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setMessage("Invalid or missing reset token");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/auth/verify-reset/${token}`
        );
        const data = await response.json();

        if (data.success) {
          setValidToken(true);
        } else {
          setValidToken(false);
          setMessage(data.message || "Invalid or expired link");
        }

      } catch(error) {
        console.error("Token verification error:", error);
        setValidToken(false);
        setMessage("Invalid reset link");
      }

    };

  verifyToken();

}, [token]);
  //  Submit new password
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Password match check
    if (password !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Passwords do not match",
        confirmButtonColor: "#ef4444"
      });
      return;
    }

    // password strength check
    if (password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Weak Password",
        text: "Password must be at least 6 characters",
      });
      return;
    }

    try {

      const response = await fetch(
        `${BASE_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token,
            password
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: "Password reset successful",
          text: "You can now login with your new password",
          confirmButtonColor: "#0dab4c"
        });

        navigate("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message,
          confirmButtonColor: "#ef4444"
        });
      }

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Please try again later",
        confirmButtonColor: "#ef4444"
      });
    }
  };

  //  Loading state
  if (validToken === null) {
    return <div style={{ textAlign: "center", marginTop: 120 }}>Checking link...</div>;
  }

  //  Invalid token
  if (!validToken) {
    return (
      <div style={{ textAlign: "center", marginTop: 120 }}>
        <h2>{message}</h2>
      </div>
    );
  }

  // Valid token UI
  return (
    <div className="login-container">

      <div className="left-section">
        <h1>EliteSpot</h1>
        <p>
          Schedule your parking in advance by selecting a date,
          time, and available flexi slot.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        {/*  New Password */}
        <div className="input-group">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {/* Confirm Password */}
        <div className="input-group">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {/* Confirm Password */}
        <button className="login-btn" type="submit">
          Reset Password
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;