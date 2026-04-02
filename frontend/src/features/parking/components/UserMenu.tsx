import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";

// Type for MenuItem props (better than using `any`)
type MenuItemProps = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

export default function UserMenu() {
  const { t } = useTranslation();
  // State to control dropdown visibility
  const [open, setOpen] = useState(false);

  // Ref to detect outside clicks
  const menuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // Get user details from localStorage
  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("userRole");

  /**
   * Reusable Menu Item Component
   */
  const MenuItem = ({ label, onClick, danger = false }: MenuItemProps) => (
    <div
      onClick={onClick}
      style={{
        padding: "12px 16px",
        cursor: "pointer",
        fontSize: "14px",
        transition: "all 0.2s ease",
        color: danger ? "#dc2626" : "#111"
      }}
      // Hover effect
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? "rgba(220,38,38,0.1)"
          : "rgba(0,0,0,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {label}
    </div>
  );

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   * Handle Logout
   */
  const handleLogout = () => {
    // Clear stored session data
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("selectedDate");
    localStorage.removeItem("fromTime");
    localStorage.removeItem("toTime");

    // Redirect to login page
    navigate("/login");
  };

  return (
    <div
      ref={menuRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      {/* User Icon */}
      <FaUserCircle
        size={32}
        style={{ cursor: "pointer" }}
        onClick={() => setOpen((prev) => !prev)} // cleaner toggle
      />

      {/* Dropdown Menu */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            right: "0",
            width: "200px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
            overflow: "hidden",
            zIndex: 1000,
            animation: "fadeIn 0.2s ease"
          }}
        >
          {/* USER HEADER */}
          <div
            style={{
              padding: "14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderBottom: "1px solid rgba(0,0,0,0.08)"
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#1b3d2f",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold"
              }}
            >
              {username[0]?.toUpperCase()}
            </div>

            {/* Username */}
            <div style={{ fontWeight: 600 }}>{username}</div>
          </div>

          {/* ADMIN MENU */}
          {role === "admin" && (
            <>
              <MenuItem
                label={t("userManagement")}
                onClick={() => navigate("/admin")}
              />
              <MenuItem
                label={t("reservations")}
                onClick={() => navigate("/admin-reservations")}
              />
              <MenuItem
                label={t("reservations")}
                onClick={() => navigate("/admin-feedback")}
              />
            </>
          )}

          {/* USER MENU */}
          {role !== "admin" && (
            <MenuItem
              label={t("feedbackDashboard")}
              onClick={() => navigate("/feedback")}
            />
          )}

          {/* LOGOUT */}
          <MenuItem label={t("logout")} danger onClick={handleLogout} />
        </div>
      )}
    </div>
  );
}