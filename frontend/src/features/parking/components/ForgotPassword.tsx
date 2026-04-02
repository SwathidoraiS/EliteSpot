import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/login.css";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ForgotPassword() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ja" : "en";
    i18n.changeLanguage(newLang);

    // optional: persist language
    localStorage.setItem("lang", newLang);
  };

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
        title: t("invalidEmail"),
        text: t("enterValidEmail"),
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
          title: t("emailSent"),
          text: t("resetLinkSent"),
          confirmButtonColor: "#0dab4c",
        });

        navigate("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: t("error"),
          text: data.message || t("somethingWrong"),
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);

      Swal.fire({
        icon: "error",
        title: t("failed"),
        text: t("resetEmailFailed"),
        confirmButtonColor: "#ef4444",
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
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>{t("forgotPasswordTitle")}</h2>

        {/* 📧 Email Input */}
        <div className="input-group">
          <input
            type="email"
            placeholder={t("enterEmail")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* 🚀 Submit */}
        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? t("sending") : t("sendResetLink")}
        </button>
      </form>

    </div>
  );
}

export default ForgotPassword;