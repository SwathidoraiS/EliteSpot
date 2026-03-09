import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function LoginPage() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

    try {

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
      });

      const data = await response.json();

      if (data.success) {

        // store token
        localStorage.setItem("token", data.data.token);

        localStorage.setItem("username", data.data.username);
        localStorage.setItem("first_name", data.data.first_name);
        localStorage.setItem("last_name", data.data.last_name);

        // navigate to landing page
        navigate("/");

      } else {
        alert(data.message);
      }

    } catch (error) {
      console.error(error);
      alert("Login failed");
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

      <form className="login-card" onSubmit={handleLogin}>

        <h2>Welcome Back !</h2>

    <div className="input-group">
      <input
        type="text"
        placeholder="Username (Employee ID or Email)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
       />

    </div>

    <div className="input-group">
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
    </div>
    
        <div className="login-options">
          <a href="/forgot-password">Forgot password</a>
        </div>

        <button className="login-btn" type="submit" >
          Login
        </button>

      </form>

    </div>
  );
}

export default LoginPage;