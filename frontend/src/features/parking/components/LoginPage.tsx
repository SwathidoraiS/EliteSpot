import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function LoginPage() {
  // 🔐 Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ⏳ Loading state
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🚀 Login handler
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ❗ Basic validation
    if (!username || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please enter username and password",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      // ✅ Success
      if (data.success) {
        const { token, user } = data.data;

        // 🔐 Store auth data
        localStorage.setItem("token", token);
        localStorage.setItem(
          "username",
          `${user.first_name} ${user.last_name}`
        );
        localStorage.setItem("userRole", user.role);

        // 🎉 Success alert
        await Swal.fire({
          icon: "success",
          title: "Login Successful",
          timer: 1200,
          showConfirmButton: false,
        });

        // 🔀 Redirect
        navigate("/");
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message || "Invalid username or password",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#d33",
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
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Welcome Back!</h2>

        {/* 👤 Username */}
        <div className="input-group">
          <input
            type="text"
            placeholder="Username (Employee ID or Email)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* 🔑 Password */}
        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* 🔗 Options */}
        <div className="login-options">
          <a href="/forgot-password">Forgot password?</a>
        </div>

        {/* 🚀 Submit */}
        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;