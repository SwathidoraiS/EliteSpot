import { useState, useEffect, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/login.css";

type ResetParams = {
  token: string;
};

function ResetPassword() {

  const { token } = useParams<ResetParams>();
  const navigate = useNavigate();

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [validToken, setValidToken] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {

  const verifyToken = async () => {

    try {

      const response = await fetch(
        `http://localhost:5000/api/auth/verify-reset/${token}`
      );

      const data = await response.json();

      if (data.success) {
        setValidToken(true);
      } else {
        setValidToken(false);
        setMessage(data.message);
      }

    } catch {
      setValidToken(false);
      setMessage("Invalid reset link");
    }

  };

  verifyToken();

}, [token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {

      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
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
        alert("Password reset successful");
        navigate("/login");
      } else {
        alert(data.message);
      }

    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  if (validToken === null) {
  return <div style={{ textAlign: "center", marginTop: 120 }}>Checking link...</div>;
}

if (!validToken) {
  return (
    <div style={{ textAlign: "center", marginTop: 120 }}>
      <h2>{message}</h2>
    </div>
  );
}

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

        <h2>Reset Password</h2>

        <div className="input-group">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button className="login-btn" type="submit">
          Reset Password
        </button>

      </form>

    </div>
  );
}

export default ResetPassword;