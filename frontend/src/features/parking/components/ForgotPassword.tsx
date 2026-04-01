import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  // 📧 Email validation regex
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 🚀 Submit handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ❗ Validate email format
    if (!isValidEmail(email)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      // ✅ Success
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: "Email Sent!",
          text: "Password reset link has been sent to your email",
          confirmButtonColor: "#0dab4c",
        });

        navigate("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Something went wrong",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Unable to send reset email. Try again later.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false); // ✅ always runs
    }
  };

  return (
    <div className="login-container">

      {/* LEFT SIDE */}
      <div className="left-section">
        <h1>EliteSpot</h1>
        <p>
          Schedule your parking in advance by selecting a date,
          time, and available flexi slot.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>

        {/* 📧 Email Input */}
        <div className="input-group">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* 🚀 Submit */}
        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

    </div>
  );
}

export default ForgotPassword;