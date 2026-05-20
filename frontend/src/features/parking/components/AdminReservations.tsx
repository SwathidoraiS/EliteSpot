import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { FiArrowLeft } from "react-icons/fi";
import { useTranslation } from "react-i18next";

// Booking type definition
interface Booking {
  booking_id: number;
  name: string;
  Emp_id: string;
  slot_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: "BOOKED" | "PARKED" | "CANCELLED" | "COMPLETED";
}
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AdminReservations = () => {
  const { t, i18n } = useTranslation();
 
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ja" : "en";
    i18n.changeLanguage(newLang);

    // optional: persist language
    localStorage.setItem("lang", newLang);
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
  const calculateItemsPerPage = () => {
    const screenHeight = window.innerHeight;

    if (isMobile) {
      const rows = Math.floor((screenHeight - 350) / 140);
      setItemsPerPage(rows > 2 ? rows : 3);
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
    setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
      setBookings([]);
    }
  };

  // Format time (HH:mm)
  const formatTime = (time: string): string => {
    if (!time) return "--";

    const [hours, minutes] = time.split(":");
      return `${hours.padStart(2, "0")}:${minutes}`;
  };

  // Apply filters (search + date + status)
  const filtered = bookings.filter((b: Booking) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.Emp_id.toLowerCase().includes(search.toLowerCase());

    const matchesDate =
      !dateFilter ||
      new Date(b.booking_date).toISOString().split("T")[0] === dateFilter;

    const matchesStatus =
      statusFilter === "ALL" || b.status === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  // pagination slice
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentData = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div style={{ padding: 20 }}>
      <div className="language-switch-login">
        <button onClick={toggleLanguage}>
          {i18n.language === "en" ? "日本語" : "EN"}
        </button>
      </div>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <FiArrowLeft
          size={22}
          style={{cursor:"pointer"}}
          onClick={() => window.history.back()}
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

    </div>

      {/* ================= RESERVATION LIST ================= */}

{isMobile ? (

  // ================= MOBILE VIEW =================
  currentData.map((item: any) => {
    const initials = item.name[0];

    return (
      <div key={item.id} style={mobileCard}>

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
          <div><b>Slot:</b> {item.slot_id}</div>
          <div><b>Date:</b> {new Date(item.booking_date).toLocaleDateString()}</div>
          <div><b>Time:</b>  {formatTime(item.start_time)} - {formatTime(item.end_time)}</div>
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
                    item.status === "CANCELLED" ?  "#dc2626" :
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
        <th style={thStyle}>User</th>
        <th style={thStyle}>Emp ID</th>
        <th style={thStyle}>Slot</th>
        <th style={thStyle}>Date</th>
        <th style={thStyle}>Time</th>
        <th style={thStyle}>Status</th>
      </tr>
    </thead>

    <tbody>
      {currentData.map((item: any) => {
        const initials = item.name[0];

        return (
          <tr key={item.id}>
            <td style={tdStyle}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={avatar}>{initials}</div>
                <div>{item.name}</div>
              </div>
            </td>

            <td style={tdStyle}>{item.Emp_id}</td>
            <td style={tdStyle}>{item.slot_id}</td>
            <td style={tdStyle}>{new Date(item.booking_date).toLocaleDateString()}</td>
            <td style={tdStyle}>{formatTime(item.start_time)} - {formatTime(item.end_time)}</td>
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
                    item.status === "CANCELLED" ?  "#dc2626" :
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
      <div
          style={{
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
            gap:8,
            marginTop:10
          }}
          >
          <button
          disabled={currentPage===1}
          onClick={()=>setCurrentPage(currentPage-1)}
          style={pageBtn}
          >
          {"<"}
          </button>

          {Array.from({length:totalPages},(_,i)=>(
          <button
          key={i}
          onClick={()=>setCurrentPage(i+1)}
          style={{
          ...pageBtn,
          background: currentPage===i+1 ? "#e5e7eb" : "#fff"
          }}
          >
          {i+1}
          </button>
          ))}

          <button
          disabled={currentPage===totalPages}
          onClick={()=>setCurrentPage(currentPage+1)}
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