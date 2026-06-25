import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/login.css";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function LoginPage() {

  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ja" : "en";
    i18n.changeLanguage(newLang);

    // optional: persist language
    localStorage.setItem("lang", newLang);
  };

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
        title: t("missingFields"),
        text: t("enterCredentials"),
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

        // 🔀 Redirect
        navigate("/");
      } else {
        Swal.fire({
          icon: "error",
          title: t("loginFailed"),
          text: data.message || t("invalidCredentials"),
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      Swal.fire({
        icon: "error",
        title: t("error"),
        text: t("somethingWrong"),
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // ✅ always runs
    }
  };

  return (
    <div className="login-container">

      <div className="language-switch-login">
        <button onClick={toggleLanguage}>
          {i18n.language === "en" ? "日本語" : "EN"}
        </button>
      </div>

      {/* LEFT SIDE */}
      <div className="left-section">
        <h1>{t("app_name")}</h1>
        <p>{t("loginDescription")}</p>
      </div>

      {/* RIGHT SIDE */}
      <form className="login-card" onSubmit={handleLogin}>
        <h2>{t("welcomeBack")}</h2>

        {/* 👤 Username */}
        <div className="input-group">
          <input
            type="text"
            placeholder={t("usernamePlaceholder")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* 🔑 Password */}
        <div className="input-group">
          <input
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* 🔗 Options */}
        <div className="login-options">
          <a href="/forgot-password">{t("forgotPassword")}</a>
        </div>

        {/* 🚀 Submit */}
        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? t("loggingIn") : t("login")}
        </button>
      </form>
    </div>
  );
}


export default LoginPage;

