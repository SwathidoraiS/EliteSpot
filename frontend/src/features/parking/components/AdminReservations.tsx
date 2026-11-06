import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { FiArrowLeft } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import UserMenu from "./UserMenu";
import { useNavigate } from "react-router-dom";
// Booking type definition
interface Booking {
  booking_id: number;
  name: string;
  Emp_id: string;
  parking_area: string;
  slot_id: string;
  booking_start: string;
  booking_end: string;
  status: "BOOKED" | "PARKED" | "CANCELLED" | "COMPLETED";
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AdminReservations = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ja" : "en";
    i18n.changeLanguage(newLang);

    // optional: persist language
    localStorage.setItem("lang", newLang);
  };

  const formatDateTime = (dateTime: string) => {

    if (!dateTime) return "";

    // Keep the date/time exactly as received from the database

    const match = dateTime.match(
      /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/
    );

    if (!match) return dateTime;
    const [, year, month, day, hours, minutes] = match;
    return `${year}-${month}-${day} ${hours}:${minutes}`;

  };


  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Filters
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [areaFilter, setAreaFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const calculateItemsPerPage = () => {
      const screenHeight = window.innerHeight;

      if (isMobile) {
        const rows = Math.floor((screenHeight - 350) / 140);
        setItemsPerPage(rows > 2 ? rows : 2);
      } else {
        const rows = Math.floor((screenHeight - 350) / 60);
        setItemsPerPage(rows > 5 ? rows : 6);
      }
    };

    calculateItemsPerPage();
    window.addEventListener("resize", calculateItemsPerPage);

    return () => window.removeEventListener("resize", calculateItemsPerPage);
  }, [isMobile]);

  //  Data
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // API call (Admin bookings)
  const fetchBookings = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/bookings/admin-bookings`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await res.json();
      console.log("Admin Booking:", data.bookings?.[0]);
      console.log("First Admin Booking json:", JSON.stringify(data.bookings?.[0], null, 2))
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
      setBookings([]);
    }
  };

  // Apply filters (search + date + status)
  const filtered = bookings.filter((b: Booking) => {
    const searchTerm = (search ?? "").toLowerCase();

    const matchesSearch = [
      b.name,
      b.Emp_id
    ].some(value =>
      String(value ?? "").toLowerCase().includes(searchTerm)
    );

    const matchesDate =
      !dateFilter ||
      new Date(b.booking_start).toISOString().split("T")[0] === dateFilter;

    const matchesStatus =
      statusFilter === "ALL" || b.status === statusFilter;

    const matchesArea =
      areaFilter === "ALL" || b.parking_area === areaFilter;

    return matchesSearch && matchesDate && matchesStatus && matchesArea;
  });

  // pagination slice
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



      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <FiArrowLeft
          size={22}
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        />
        <h2 style={{ margin: 0 }}>{t("memoryLane")}</h2>
      </div>

      {/* Search */}
      <div style={{
        background: "#fff",
        padding: 12,
        borderRadius: 12,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        marginBottom: 10,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 10
      }}>

        {/* Search */}
        <div style={{ position: "relative", width: 300 }}>
          <FiSearch style={{ position: "absolute", left: 10, top: 12, color: "#888" }} />

          <input
            type="text"
            placeholder={t("search")}
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

        {/* Date */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{
            height: 38,
            borderRadius: 8,
            border: "1px solid #d1d5db",
            padding: "0 10px"
          }}
        />

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            height: 38,
            borderRadius: 8,
            border: "1px solid #d1d5db",
            padding: "0 10px"
          }}
        >
          <option value="ALL">{t("allStatus")}</option>
          <option value="BOOKED">{t("booked")}</option>
          <option value="PARKED">{t("parked")}</option>
          <option value="CANCELLED">{t("cancelled")}</option>
          <option value="COMPLETED">{t("exit")}</option>
        </select>

        {/* Parking Area */}
        <select
          value={areaFilter}
          onChange={(e) => {
            setAreaFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            height: 38,
            borderRadius: 8,
            border: "1px solid #d1d5db",
            padding: "0 10px"
          }}
        >
          <option value="ALL">All Parking Areas</option>
          {[...new Set(bookings.map(b => b.parking_area).filter(Boolean))]
            .sort()
            .map(area => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
        </select>

      </div>

      {/* ================= RESERVATION LIST ================= */}

      {isMobile ? (

        // ================= MOBILE VIEW =================
        currentData.map((item: Booking) => {
          const initials = item.name[0];

          return (
            <div key={item.booking_id} style={mobileCard}>

              {/* Top */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={avatar}>{initials}</div>

                  <div>
                    <div>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#777" }}>
                      {item.Emp_id}
                    </div>
                  </div>
                </div>

              </div>

              {/* Details */}
              <div style={{ marginTop: 10, fontSize: 14 }}>
                <div><b>Parking Area:</b>{item.parking_area || "-"}</div>
                <div><b>Slot:</b> {item.slot_id}</div>
                <div><b>From:</b> {formatDateTime(item.booking_start)}</div>
                <div><b>Time:</b>  {formatDateTime(item.booking_end)}</div>
                <div><b>Status:</b>  <span style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background:
                    item.status === "BOOKED" ? "#dbeafe" :
                      item.status === "COMPLETED" ? "#dcfce7" :
                        item.status === "CANCELLED" ? "#fee2e2" :
                          "#e5e7eb",
                  color:
                    item.status === "BOOKED" ? "#2563eb" :
                      item.status === "COMPLETED" ? "#16a34a" :
                        item.status === "CANCELLED" ? "#dc2626" :
                          "#374151"
                }}>
                  {item.status === "COMPLETED" ? t("exit") : t(item.status.toLowerCase())}
                </span></div>
              </div>

            </div>
          );
        })

      ) : (

        // ================= DESKTOP TABLE =================
        <table style={tableStyle}>
          <thead style={{ background: "#f4f6f8" }}>
            <tr>
              <th style={thStyle}>{t("user")}</th>
              <th style={thStyle}>{t("empId")}</th>
              <th style={thStyle}>{t("parkingArea")}</th>
              <th style={thStyle}>{t("slot")}</th>
              <th style={thStyle}>{t("from")}</th>
              <th style={thStyle}>{t("to")}</th>
              <th style={thStyle}>{t("status")}</th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((item: Booking) => {
              const initials = item.name[0];

              return (
                <tr key={item.booking_id}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={avatar}>{initials}</div>
                      <div>{item.name}</div>
                    </div>
                  </td>

                  <td style={tdStyle}>{item.Emp_id}</td>
                  <td style={tdStyle}>{item.parking_area || "-"}</td>
                  <td style={tdStyle}>{item.slot_id}</td>
                  <td style={tdStyle}>{formatDateTime(item.booking_start)}</td>
                  <td style={tdStyle}>{formatDateTime(item.booking_end)} </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background:
                        item.status === "BOOKED" ? "#dbeafe" :
                          item.status === "COMPLETED" ? "#dcfce7" :
                            item.status === "CANCELLED" ? "#fee2e2" :
                              "#e5e7eb",
                      color:
                        item.status === "BOOKED" ? "#2563eb" :
                          item.status === "COMPLETED" ? "#16a34a" :
                            item.status === "CANCELLED" ? "#dc2626" :
                              "#374151"
                    }}>
                      {item.status === "COMPLETED" ? t("exit") : t(item.status.toLowerCase())}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

      )}
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

/* Styles */
const tdStyle = {
  padding: 12,
  borderBottom: "1px solid #eee"
};

const avatar = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  background: "#94a3b8",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const pageBtn = {
  padding: "6px 10px",
  border: "1px solid #d1d5db",
  background: "#fff",
  cursor: "pointer",
  borderRadius: 4
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  background: "#fff",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
};

const thStyle = {
  padding: 12,
  borderBottom: "1px solid #ddd",
  textAlign: "left" as const
};



const mobileCard = {
  background: "#fff",
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
};

export default AdminReservations;