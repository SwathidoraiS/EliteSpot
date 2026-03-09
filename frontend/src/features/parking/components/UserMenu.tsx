import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
const handleLogout = () => {
  // remove login token
  localStorage.removeItem("token");
  localStorage.removeItem("selectedDate");
  localStorage.removeItem("fromTime");
  localStorage.removeItem("toTime");

  // redirect to login page
  navigate("/login");
};
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      
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
      top: "45px",
      right: "0",
      width: "160px",
      background: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      overflow: "hidden",
      zIndex: 1000
    }}
  >

    {/* Username */}
    <div
      style={{
        padding: "10px 14px",
        fontWeight: 600,
        borderBottom: "1px solid #eee",
        background: "#f8fafc"
      }}
    >
      👤 {username}
    </div>

    <div
      style={menuItem}
      onClick={() => {
        navigate("/admin");
        setOpen(false);
      }}
    >
      Admin
    </div>

    <div
      style={menuItem}
      onClick={() => {
        handleLogout();
        setOpen(false);
      }}
    >
      Logout
    </div>

  </div>
)}
    </div>
  );
}

const menuItem = {
  padding: "10px 14px",
  cursor: "pointer",
  borderBottom: "1px solid #eee"
};