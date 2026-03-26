import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("userRole");
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

    {role === "admin" && (
  <>
    <div
      style={menuItem}
      onClick={() => {
        navigate("/admin");
        setOpen(false);
      }}
    >
      Admin Dashboard
    </div>

    <div
      style={menuItem}
      onClick={() => {
        navigate("/admin-reservations");
        setOpen(false);
      }}
    >
      Reservations
    </div>
  </>
)}

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