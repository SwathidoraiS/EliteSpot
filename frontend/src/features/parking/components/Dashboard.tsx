import { useEffect, useState } from "react";

type Props = {
  isMobile: boolean;
  availableCount: number;
  date: string;
  fromTime: string;
  toTime: string;
};

export default function Dashboard({ isMobile, availableCount, date, fromTime, toTime }: Props) {
  const [parked, setParked] = useState(0);

  // fetch function
  const fetchDashboard = () => {
  if (!date || !fromTime || !toTime) {
    console.log("Skipping dashboard fetch");
    return;
  }

  fetch(`http://localhost:5000/api/dashboard?date=${date}&start=${fromTime}&end=${toTime}`)
    .then(res => {
      if (!res.ok) throw new Error("API error");
      return res.json();
    })
    .then(data => {
  setParked(data.data.parked_slots);   // ✅ ONLY THIS
})
    .catch(err => console.error("Dashboard error:", err));
};

  // initial load
  useEffect(() => {
    fetchDashboard();
  }, [date, fromTime, toTime]);

  // auto refresh every 3 sec
  useEffect(() => {
  if (!date || !fromTime || !toTime) return;

  const interval = setInterval(() => {
    fetchDashboard();
  }, 3000);

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