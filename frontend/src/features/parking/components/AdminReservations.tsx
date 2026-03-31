import { useEffect, useState } from "react";
import axios from "axios";
import { FiSearch } from "react-icons/fi";
import { FiArrowLeft } from "react-icons/fi";

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

const AdminReservations = () => {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/bookings/admin-bookings",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
      setBookings([]);
    }
  };

  const formatTime = (time: string): string => {
  if (!time) return "--";

  const [hours, minutes] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes}`;
};
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
    <div style={{ padding: 30 }}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
  <FiArrowLeft
    size={22}
    style={{cursor:"pointer"}}
    onClick={() => window.history.back()}
  />
  <h2 style={{margin:0}}>Reservation Management</h2>
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
      placeholder="Search..."
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
    <option value="ALL">All Status</option>
    <option value="BOOKED">Booked</option>
    <option value="PARKED">Parked</option>
    <option value="CANCELLED">Cancelled</option>
    <option value="COMPLETED">Completed</option>
  </select>

</div>

      {/* Table */}
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
          {currentData.map((b) => (
            <tr key={b.booking_id}>

              {/* User */}
              <td style={tdStyle}>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={avatar}>
                    {b.name?.[0]}
                  </div>
                  <div>{b.name}</div>
                </div>
              </td>

              <td style={tdStyle}>{b.Emp_id}</td>
              <td style={tdStyle}>{b.slot_id}</td>

              <td style={tdStyle}>
                {new Date(b.booking_date).toLocaleDateString()}
              </td>

              <td style={tdStyle}>
                {formatTime(b.start_time)} - {formatTime(b.end_time)}
              </td>

              {/* Status */}
              <td style={tdStyle}>
                <span style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background:
                    b.status === "BOOKED" ? "#dbeafe" :
                    b.status === "COMPLETED" ? "#dcfce7" :
                    b.status === "CANCELLED" ? "#fee2e2" :
                    "#e5e7eb",
                color:
                    b.status === "BOOKED" ? "#2563eb" :
                    b.status === "COMPLETED" ? "#16a34a" :
                    b.status === "CANCELLED" ? "#dc2626" :
                    "#374151"
                }}>
                  {b.status}
                </span>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
      <div style={{
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 6,
  marginTop: 15
}}>

  {/* Prev */}
  <button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(currentPage - 1)}
    style={pageBtn}
  >
    {"<"}
  </button>

  {/* Page Numbers (LIMITED) */}
  {Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((page) => {
      return (
        page === 1 ||
        page === totalPages ||
        Math.abs(page - currentPage) <= 1
      );
    })
    .map((page, index, arr) => (
      <span key={page} style={{ display: "flex", alignItems: "center" }}>
        
        {/* Add ... */}
        {index > 0 && page - arr[index - 1] > 1 && (
          <span style={{ padding: "0 5px" }}>...</span>
        )}

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

export default AdminReservations;