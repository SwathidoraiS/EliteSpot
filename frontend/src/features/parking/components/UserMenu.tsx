import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { FaRegEdit } from "react-icons/fa";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type MenuItemProps = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

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

export default function UserMenu() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [username, setUsername] = useState(
    localStorage.getItem("username") || "User"
  );

  const [editOpen, setEditOpen] = useState(false);
  const [firstName, setFirstName] = useState(
    localStorage.getItem("firstName") || ""
  );
  const [lastName, setLastName] = useState(
    localStorage.getItem("lastName") || ""
  );
  const [saving, setSaving] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const role = localStorage.getItem("userRole");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setEditOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("selectedDate");
    localStorage.removeItem("fromTime");
    localStorage.removeItem("toTime");

    navigate("/login");
  };

  const handleEditName = () => {
    setFirstName(localStorage.getItem("firstName") || "");
    setLastName(localStorage.getItem("lastName") || "");
    setEditOpen(true);
  };

  const handleUpdateName = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Please enter both first name and last name."
      });
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/users/update-name`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: trimmedFirstName,
          last_name: trimmedLastName
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update name.");
      }

      const updatedName = `${trimmedFirstName} ${trimmedLastName}`;

      localStorage.setItem("firstName", trimmedFirstName);
      localStorage.setItem("lastName", trimmedLastName);
      localStorage.setItem("username", updatedName);

      setUsername(updatedName);
      setEditOpen(false);

      Swal.fire({
        icon: "success",
        title: "Name updated",
        text: "Your name has been updated successfully.",
        confirmButtonColor: "#1b3d2f"
      });
    } catch (error) {
      console.error("Name update error:", error);

      Swal.fire({
        icon: "error",
        title: "Update failed",
        text:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={menuRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      <FaUserCircle
        size={isMobile ? 20 : 26}
        style={{ cursor: "pointer" }}
        onClick={() => setOpen((prev) => !prev)}
      />

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
              padding: "10px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderBottom: "1px solid rgba(0,0,0,0.08)"
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
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

            <div
              onClick={handleEditName}
              title="Edit name"
              style={{
                fontWeight: 600,
                cursor: "pointer",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "13px"
              }}
            >
              <span>{username}</span>
              <FaRegEdit
  size={13}
  style={{ color: "#666" }}
/>
            </div>
          </div>

          {/* ADMIN MENU */}
          {role === "admin" && (
            <>
              <MenuItem
                label={t("userManagement")}
                onClick={() => navigate("/admin")}
              />
              <MenuItem
                label={t("memoryLane")}
                onClick={() => navigate("/admin-reservations")}
              />
              <MenuItem
                label={t("Feedbacks")}
                onClick={() => navigate("/admin-feedback")}
              />
              <MenuItem
                label={t("Request")}
                onClick={() => navigate("/admin-businessTrip")}
              />
              <MenuItem
                label={t("Layout Designer")}
                onClick={() => navigate("/admin-layout-designer")}
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
          <MenuItem
            label={t("logout")}
            danger
            onClick={handleLogout}
          />
        </div>
      )}

      {/* EDIT NAME POPUP */}
      {editOpen && (
        <div
          onClick={() => !saving && setEditOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "380px",
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.2)"
            }}
          >
            <h3
              style={{
                margin: "0 0 6px",
                color: "#1b3d2f",
                fontSize: "20px"
              }}
            >
              Edit Name
            </h3>

            <p
              style={{
                margin: "0 0 20px",
                color: "#777",
                fontSize: "13px"
              }}
            >
              Update your profile name.
            </p>

            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "6px"
              }}
            >
              First Name
            </label>

            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={saving}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px"
              }}
            />

            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "6px"
              }}
            >
              Last Name
            </label>

            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={saving}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginBottom: "22px",
                fontSize: "14px"
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px"
              }}
            >
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                disabled={saving}
                style={{
                  padding: "10px 16px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  background: "#fff",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdateName}
                disabled={saving}
                style={{
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#1b3d2f",
                  color: "#fff",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}