import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function ForgotPassword() {

  const [email, setEmail] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Forgot password clicked");
    console.log("Email:", email);

    const response = await fetch(
      "http://localhost:5000/api/auth/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      }
    );

    const data = await response.json();

    if (data.success) {
      alert("Reset email sent!");
      navigate("/login");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="login-container">

      <div className="left-section">
        <h1>EliteSpot</h1>
        <p>
          Schedule your parking in advance by selecting a date,
          time, and available flexi slot.
        </p>
      </div>

      <form className="login-card" onSubmit={handleSubmit}>

        <h2>Forgot Password</h2>

        <div className="input-group">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button className="login-btn" type="submit">
          Send Reset Link
        </button>

      </form>

    </div>
  );
}

export default ForgotPassword;