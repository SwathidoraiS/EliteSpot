import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Props type
type Props = {
  isMobile: boolean;
  availableCount: number;
  date: string;
  fromTime: string;
  toTime: string;
};

export default function Dashboard({ isMobile, availableCount, date, fromTime, toTime }: Props) {

  // Parked slots count (from API)
  const [parked, setParked] = useState(0);

  //  Fetch dashboard data from backend
  const fetchDashboard = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/dashboard?date=${date}&start=${fromTime}&end=${toTime}`
      );

      const data = await res.json();

      setParked(data?.data?.parked_slots || 0);

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  // Fetch when filters change (initial + updates)
  useEffect(() => {
    fetchDashboard();
  }, [date, fromTime, toTime]);

  // Auto refresh every 3 second
  useEffect(() => {
    if (!date || !fromTime || !toTime) return;

    const interval = setInterval(() => {
      fetchDashboard();
    }, 5000);

    // Cleanup interval on unmount or dependency change
    return () => clearInterval(interval);
  }, [date, fromTime, toTime]);

  return (
    <div
      style={{
        display: "flex",
        gap: 15,
        width: "100%",
        flexDirection: "row",
      }}
    >
      <div style={{ display: "flex", gap: "15px" }}>

        {/* Available */}
        <div
          style={{
            background: "linear-gradient(145deg, #ffffff, #f3f6f9)",
            padding: "10px 20px",
            borderRadius: 14,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            width: isMobile ? "50%" : 170,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
            Available Slots
          </p>
          <h3 style={{ margin: "4px 0 0 0", fontSize: 20 }}>
            {availableCount}
          </h3>
        </div>

        {/* Parked */}
        <div
          style={{
            background: "linear-gradient(145deg, #ffffff, #f3f6f9)",
            padding: "10px 20px",
            borderRadius: 14,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            width: isMobile ? "50%" : 170,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
            Parked Slots
          </p>
          <h3 style={{ margin: "4px 0 0 0", fontSize: 20 }}>
            {parked}
          </h3>
        </div>
      </div>
    </div>
  );
}