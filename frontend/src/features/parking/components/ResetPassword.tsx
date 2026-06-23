import { useState, useEffect, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/login.css";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ResetParams = {
  token: string;
};

function ResetPassword() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ja" : "en";
    i18n.changeLanguage(newLang);

    // optional: persist language
    localStorage.setItem("lang", newLang);
  };

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
      setMessage(t("invalidOrMissingToken"));
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
          setMessage(data.message || t("invalidOrExpiredLink"));
        }

      } catch(error) {
        console.error("Token verification error:", error);
        setValidToken(false);
        setMessage(t("invalidResetLink"));
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
        title: t("passwordsNotMatch"),
        confirmButtonColor: "#ef4444"
      });
      return;
    }

    // password strength check
    if (password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: t("weakPassword"),
        text: t("passwordMinLength"),
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
          title: t("passwordResetSuccess"),
          text: t("loginWithNewPassword"),
          confirmButtonColor: "#0dab4c"
        });
        navigate("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: t("error"),
          text: data.message,
          confirmButtonColor: "#ef4444"
        });
      }

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: t("somethingWrong"),
        text: t("tryAgainLater"),
        confirmButtonColor: "#ef4444"
      });
    }
  };

  //  Loading state
  if (validToken === null) {
    return <div style={{ textAlign: "center", marginTop: 120 }}>{t("checkingLink")}</div>;
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

      <div className="language-switch-login">
        <button onClick={toggleLanguage}>
          {i18n.language === "en" ? "日本語" : "EN"}
        </button>
      </div>

      <div className="left-section">
        <h1>{t("app_name")}</h1>
        
      </div>

      {/* RIGHT SIDE */}
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>{t("resetPasswordTitle")}</h2>
        {/*  New Password */}
        <div className="input-group">
          <input
            type="password"
            placeholder={t("newPassword")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {/* Confirm Password */}
        <div className="input-group">
          <input
            type="password"
            placeholder={t("confirmPassword")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {/* Confirm Password */}
        <button className="login-btn" type="submit">
          {t("resetPassword")}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;