import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("userRole");
  const MenuItem = ({ label, onClick, danger = false }: any) => (
  <div
    onClick={onClick}
    style={{
      padding: "12px 16px",
      cursor: "pointer",
      fontSize: "14px",
      transition: "all 0.2s ease",
      color: danger ? "#dc2626" : "#111"
    }}
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
  useEffect(() => {

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };

}, []);
  const handleLogout = () => {
  // remove login token
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("selectedDate");
  localStorage.removeItem("fromTime");
  localStorage.removeItem("toTime");

  // redirect to login page
  navigate("/login");
};


  return (
    <div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
      
      {/* User Icon */}
      <FaUserCircle
        size={32}
        style={{ cursor: "pointer" }}
        onClick={() => setOpen(!open)}
      />

      {/* Dropdown */}
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
      <div style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "#1b3d2f",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold"
      }}>
        {username[0]}
      </div>

      <div style={{ fontWeight: 600 }}>
        {username}
      </div>
    </div>

    {/* MENU ITEMS */}
    {role === "admin" && (
      <>
        <MenuItem label="User Management" onClick={() => navigate("/admin")} />
        <MenuItem label="Reservations" onClick={() => navigate("/admin-reservations")} />
        <MenuItem label="Feedback Dashboard" onClick={() => navigate("/admin-feedback")} />
      </>
    )}

    {role !== "admin" && (
      <MenuItem
        label="Feedback Desk"
        onClick={() => navigate("/feedback")}
      />
    )}

    <MenuItem
      label="Logout"
      danger
      onClick={() => {
        handleLogout();
      }}
    />

  </div>
)}
    </div>
  );
}

