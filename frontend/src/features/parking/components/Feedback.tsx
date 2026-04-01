import Swal from "sweetalert2";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "../styles/login.css"; 

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FeedbackPage() {
  const navigate = useNavigate();

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
    { label: "😠", value: 1 },
    { label: "🙁", value: 2 },
    { label: "😐", value: 3 },
    { label: "🙂", value: 4 },
    { label: "😄", value: 5 },
  ];

    // Submit handler
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validate rating
        if (!rating) {
            Swal.fire({
                icon: "warning",
                title: "Select rating",
                text: "Please select a rating before submitting",
            });
            return;
        }

         // Validate word limit
        const wordCount = feedback.trim().split(/\s+/).filter(Boolean).length;

        if (wordCount > 300) {
            Swal.fire({
                icon: "error",
                title: "Limit exceeded",
                text: "Feedback cannot exceed 300 words"
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    rating,
                    message: feedback,
                }),
            });

            const data = await response.json();

            // Success
            if (data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Thank you!",
                    text: "Feedback submitted successfully",
                    confirmButtonColor: "#1b3d2f"
                });

                // Reset form
                setRating(0);
                setFeedback("");
            } else {
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: data.message || "Failed to submit feedback",
            });
            }

        } catch (error) {
            console.error("Feedback error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong. Please try again.",
            });
        } finally{
            setLoading(false);
        }
        
    };

    return (
        <div className="login-container">
            <div
            style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#080808",
                cursor: "pointer",
                zIndex: 1000
            }}
            onClick={() => navigate(-1)}
            >
            <FiArrowLeft size={22} />
            <span style={{ fontSize: "14px" }}></span>
            </div>

            {/* LEFT SIDE (same style as login) */}
            <div className="left-section">
                <h1>EliteSpot</h1>
                <p>
                We value your feedback. Help us improve your parking experience.
                </p>
            </div>

            {/* RIGHT SIDE (card same as login) */}
            <form className="login-card" onSubmit={handleSubmit}>

                <h2>Feedback</h2>

                {/* RATING */}
                <div className="input-group">
                <p style={{ marginBottom: "10px" }}>
                    Rate your experience:
                </p>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    {ratings.map((r) => (
                    <span
                        key={r.value}
                        onClick={() => setRating(r.value)}
                        style={{
                        fontSize: "28px",
                        cursor: "pointer",
                        opacity: rating === r.value ? 1 : 0.5,
                        transform: rating === r.value ? "scale(1.2)" : "scale(1)",
                        transition: "0.2s",
                        }}
                    >
                        {r.label}
                    </span>
                    ))}
                </div>
            </div>

            {/* TEXTAREA */}
            <div className="input-group">
            <textarea
                placeholder="Write your feedback..."
                value={feedback}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
                    minHeight: "100px"
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
                {wordCount} / 300 words
                </p>

                {/* BUTTON */}
                <button className="login-btn" type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Feedback"}
                </button>
            </form>
        </div>
    );
}

export default FeedbackPage;