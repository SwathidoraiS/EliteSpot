import Swal from "sweetalert2";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "../styles/login.css"; 

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FeedbackPage() {

  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ja" : "en";
    i18n.changeLanguage(newLang);

    // optional: persist language
    localStorage.setItem("lang", newLang);
  };

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // Rating (1–5)
  const [rating, setRating] = useState(0);

   // Feedback text
  const [feedback, setFeedback] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Word count (real-time)
  const wordCount = feedback.trim() === ""
  ? 0
  : feedback.trim().split(/\s+/).filter(Boolean).length;

  //  Rating emojis
 const ratings = [
  { label: "★", value: 1 },
  { label: "★", value: 2 },
  { label: "★", value: 3 },
  { label: "★", value: 4 },
  { label: "★", value: 5 },
];
    // Submit handler
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validate rating
        if (!rating) {
            Swal.fire({
                icon: "warning",
                title: t("selectRating"),
                text: t("selectRatingText"),
            });
            return;
        }

         // Validate word limit
        const wordCount = feedback.trim().split(/\s+/).filter(Boolean).length;

        if (wordCount > 300) {
            Swal.fire({
                icon: "error",
                title: t("limitExceeded"),
                text: t("feedbackLimit"),
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    rating,
                    message: feedback,
                    
                }),
            });

            const data = await response.json();
        
            // Success
            if (data.success) {
                await Swal.fire({
                    icon: "success",
                    title: t("thankYou"),
                    text: t("feedbackSuccess"),
                    confirmButtonColor: "#1b3d2f"
                });

                // Reset form
                setRating(0);
                setFeedback("");
                navigate("/");
            } else {
            Swal.fire({
                icon: "error",
                title: t("failed"),
                text: data.message || t("feedbackFailed"),
            });
            }

        } catch (error) {
            console.error("Feedback error:", error);
            Swal.fire({
                icon: "error",
                title: t("error"),
                text: t("somethingWrong"),
            });
        } finally{
            setLoading(false);
        }
        
    };

    return (
        <div className="login-container">
            <div className="language-switch-login">
        <button onClick={toggleLanguage}>
          {i18n.language === "en" ? "日本語" : "EN"}
        </button>
        
      </div>
            <div
                className="back-button"
                onClick={() => navigate(-1)}
            >
                <FiArrowLeft size={22} />
            </div>

            {/* LEFT SIDE (same style as login) */}
            <div className="left-section">
                <h1>{t("app_name")}</h1>
                
            </div>

            {/* RIGHT SIDE (card same as login) */}
            <form className="login-card" onSubmit={handleSubmit}>

                <h2 style={{ marginBottom: "15px" }}>{t("feedbackTitle")}</h2>

                {/* RATING */}
                <div className="input-group">
                <p style={{ marginBottom: "2px", marginTop: "0",}}>
                    {t("rateExperience")}
                </p>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "10px",
                    }}
                    >
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                        key={star}
                        onClick={() => setRating(star)}
                        style={{
                            fontSize: "42px",
                            cursor: "pointer",
                            color: star <= rating ? "#FFD700" : "#D3D3D3",
                            transition: "all 0.25s ease",
                            transform: star <= rating ? "scale(1.15)" : "scale(1)",
                            textShadow:
                            star <= rating
                                ? "0 0 8px rgba(255,215,0,0.6)"
                                : "none",
                            userSelect: "none",
                        }}
                        >
                        ★
                        </span>
                    ))}
                    </div>
                                </div>

                                {/* TEXTAREA */}
                                <div className="input-group">
                                <textarea
                    placeholder={t("writeFeedback")}
                    value={feedback}
                    onChange={(e) => {
                        const text = e.target.value;

                        const words = text.trim().split(/\s+/).filter(Boolean);

                        if (words.length <= 300) {
                        setFeedback(text);
                        }
                    }}
                    style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        height: "120px",        // Fixed height
                        resize: "none",         // Disable resizing
                        overflowY: "auto",      // Show vertical scrollbar
                        boxSizing: "border-box"
                    }}
                    required
                    />
                </div>
                <p
                style={{
                    fontSize: "12px",
                    marginTop: "5px",
                    color: wordCount > 280 ? "red" : "#666",
                    textAlign: "right"
                }}
                >
                {wordCount} / 300 {t("words")}
                </p>

                {/* BUTTON */}
                <button className="login-btn" type="submit" disabled={loading}>
                    {loading ? t("submitting") : t("submitFeedback")}
                </button>
            </form>
        </div>
    );
}

export default FeedbackPage;