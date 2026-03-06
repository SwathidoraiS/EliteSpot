import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
const handleLogout = () => {
  // remove login token
  localStorage.removeItem("token");

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
            width: "140px",
            background: "#ffffff",
            borderRadius: "8px",
            boxShadow: " 0 8px 24px rgba(0,0,0,0.12)",
            overflow: "hidden",
            zIndex: 1000
          }}
        >
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