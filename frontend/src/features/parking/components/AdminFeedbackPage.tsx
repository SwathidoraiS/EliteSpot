import { useEffect, useState } from "react";
import { FiSearch, FiArrowLeft } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import UserMenu from "./UserMenu";
import { useNavigate } from "react-router-dom";

// Base API URL from environment variables
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Type definition for Feedback object
interface Feedback {
  id: number;
  message: string;
  rating: number;
  created_at: string;
}

const AdminFeedbackPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ja" : "en";
    i18n.changeLanguage(newLang);

    // optional: persist language
    localStorage.setItem("lang", newLang);
  };

  //  Search & filter states
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");

  //  Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

   //  Feedback data
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // Fetch feedbacks on component mount
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  //  API call to fetch all feedbacks
  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${BASE_URL}/feedback/all`);

      if (!res.ok) {
        throw new Error("Failed to fetch feedbacks");
      }

      const data = await res.json();
      setFeedbacks(data || []);
    } catch (err) {
      console.error(err);
      setFeedbacks([]);
    }
  };
 
   // Shorten long messages for table display
  const getShortMessage = (msg: string) => {
    return msg.length > 80 ? msg.substring(0, 80) + "..." : msg;
  };

  //  Apply search + rating filter
  const filtered = feedbacks.filter((f) => {
    const matchesSearch =
      f.message.toLowerCase().includes(search.toLowerCase());

    const matchesRating =
      ratingFilter === "ALL" || f.rating.toString() === ratingFilter;

    return matchesSearch && matchesRating;
  });

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;


  const currentData = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div style={{ padding: 20 }}>
      <div className="language-switch-login">
        <button className="language-btn" onClick={toggleLanguage}>
          {i18n.language === "en" ? "EN" : "日本語"}
        </button>
        <UserMenu />
      </div>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <FiArrowLeft
          size={22}
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        />
        <h2 style={{ margin: 0 }}>{t("feedbackManagement")}</h2>
      </div>

      {/* SEARCH + FILTER */}
      <div style={{
        background: "#fff",
        padding: 12,
        borderRadius: 12,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 10
      }}>

        {/* Search */}
        <div style={{ position: "relative", width: 300 }}>
          <FiSearch style={{ position: "absolute", left: 10, top: 12, color: "#888" }} />
          <input
            type="text"
            placeholder={t("searchFeedback")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              height: 38,
              width: "100%",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              padding: "0 12px 0 38px"
            }}
          />
        </div>

        {/* Rating Filter */}
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          style={{
            height: 38,
            borderRadius: 8,
            border: "1px solid #d1d5db",
            padding: "0 10px"
          }}
        >
          <option value="ALL">{t("allRatings")}</option>
          <option value="5">⭐⭐⭐⭐⭐</option>
          <option value="4">⭐⭐⭐⭐</option>
          <option value="3">⭐⭐⭐</option>
          <option value="2">⭐⭐</option>
          <option value="1">⭐</option>
        </select>

      </div>

      {/* TABLE */}
      <table style={tableStyle}>
        <thead style={{ background: "#f4f6f8" }}>
          <tr>
            <th style={thStyle}>{t("rating")}</th>
            <th style={thStyle}>{t("message")}</th>
            <th style={thStyle}>{t("date")}</th>
          </tr>
        </thead>

        <tbody>
          {currentData.map((f) => (
            <tr key={f.id}>
              <td style={tdStyle}>
                <span style={{ color: "#fbbf24", fontSize: 16 }}>
                  {"★".repeat(f.rating) + "☆".repeat(5 - f.rating)}
                </span>
              </td>

              <td
                style={{
                  ...tdStyle,
                  cursor: "pointer",
                  color: "#111112"
                }}
                onClick={() => {
                  Swal.fire({
                    title: t("feedbackMessage"),
                    text: f.message,
                    confirmButtonColor: "#1b3d2f"
                  });
                }}
              >
                {getShortMessage(f.message)}
              </td>

              <td style={tdStyle}>
                {f.created_at.split("T")[0]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 6,
        marginTop: 15
      }}>
        {/* Previous */}
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          style={pageBtn}
        >
          {"<"}
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) =>
            page === 1 ||
            page === totalPages ||
            Math.abs(page - currentPage) <= 1
          )
          .map((page, index, arr) => (
            <span key={page}>
              {index > 0 && page - arr[index - 1] > 1 && <span>...</span>}

              <button
                onClick={() => setCurrentPage(page)}
                style={{
                  ...pageBtn,
                  background: currentPage === page ? "#d1d5db" : "#fff"
                }}
              >
                {page}
              </button>
            </span>
          ))}

        {/* Next */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          style={pageBtn}
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

/* STYLES */

const tdStyle = {
  padding: 12,
  borderBottom: "1px solid #eee"
};

const thStyle = {
  padding: 12,
  borderBottom: "1px solid #ddd",
  textAlign: "left" as const
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  background: "#fff",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
};

const pageBtn = {
  padding: "6px 10px",
  border: "1px solid #d1d5db",
  background: "#fff",
  cursor: "pointer",
  borderRadius: 4
};

export default AdminFeedbackPage;