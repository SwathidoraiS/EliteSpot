import { useState, useRef, useEffect } from "react";

type Props = {
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  fromTime: string;
  toTime: string;
  setFromTime: (value: string) => void;
  setToTime: (value: string) => void;
  selectedArea: string;
  setSelectedArea: (value: string) => void;
  isMobile: boolean; 
};

export default function FilterBar({
  selectedDate,
  setSelectedDate,
  fromTime,
  toTime,
  setFromTime,
  setToTime,
  selectedArea,
  setSelectedArea,
  isMobile
}: Props) {
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [areas, setAreas] = useState<any[]>([]);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const minDate = formatDate(today);
  const maxDate = formatDate(tomorrow);
  useEffect(() => {
  if (!selectedDate) {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }
}, []);
  // 1–12 hours
  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  
  const minutes = ["00", "15", "30", "45"];
  const periods = ["AM", "PM"];
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
  fetch(`${BASE_URL}/parking-areas`)
    .then(res => res.json())
    .then(data => {
      setAreas(data.data);
      if (data.data.length > 0) {
        setSelectedArea(String(data.data[0].area_id));
      }
    })
    .catch(err => console.error("Failed to load parking areas", err));
}, []);
  useEffect(() => {

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowTimeDropdown(false);
    }
  };
  
  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };

}, []);
  const formatTime = (h: string, m: string, p: string) => {
    if (!h || !m || !p) return "";
    return `${h}:${m} ${p}`;
  };

  return (
    <div
      style={{
        background: "linear-gradient(145deg, #ffffff, #f3f6f9)",
        padding: "16px 20px",
        borderRadius: 14,
        boxShadow:
          " 0 8px 24px rgba(0,0,0,0.12)",
        marginBottom: 10
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "auto auto auto",
          gap: 15,
          alignItems: "center"
        }}
      >

        {/* DATE */}
        <input
          type="date"
          min={minDate}
          max={maxDate}
          value={selectedDate}
          onChange={(e) => {
            const date = e.target.value;
            setSelectedDate(date);
          }}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: 6,
            fontSize: 14
          }}
        />

        {/* TIME DROPDOWN */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ccc",   // 👈 outline
              borderRadius: 6,
              fontSize: 14,
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span>
              {fromTime && toTime
                ? `${fromTime} - ${toTime}`
                : "Select Time"}
            </span>
            <span style={{ fontSize: 12 }}>▼</span>
          </div>

          {showTimeDropdown && (
            <div
              ref={dropdownRef}
              style={{
                position: "absolute",
                top: "45px",
                left: isMobile ? "50%" : 0,
                transform: isMobile ? "translateX(-50%)" : "none",
                alignItems: "center",
                width: isMobile ? "60vw" : 240,
                maxWidth: "90vw",
                background: "#fff",
                padding: 15,
                borderRadius: 10,
                boxShadow: " 0 8px 24px rgba(0,0,0,0.12)",
                zIndex: 100
              }}
            >
              {/* FROM */}
              <div style={{ marginBottom: 15 }}>
                <label style={{ fontSize: 13 }}>From</label>

                <div style={{ display: "flex", gap: 6, flexWrap: isMobile ? "wrap" : "nowrap"}}>
                  <select id="fromHour" style={{ padding: 6, flex: 1,minWidth: isMobile ? "30%" : "auto" }}>
                    <option value="">Hours</option>
                    {hours.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>

                  <select id="fromMinute" style={{ padding: 6, flex: 1,minWidth: isMobile ? "30%" : "auto" }}>
                    <option value="">Min</option>
                    {minutes.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <select id="fromPeriod" style={{ padding: 6, flex: 1,minWidth: isMobile ? "30%" : "auto" }}>
                    <option value="">AM/PM</option>
                    {periods.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TO */}
              <div>
                <label style={{ fontSize: 13 }}>To</label>

                <div style={{ display: "flex", gap: 6, flexWrap: isMobile ? "wrap" : "nowrap"}}>
                  <select id="toHour" style={{ padding: 6 , flex: 1, minWidth: isMobile ? "30%" : "auto"}}>
                    <option value="">Hours</option>
                    {hours.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>

                  <select id="toMinute" style={{ padding: 6, flex: 1, minWidth: isMobile ? "30%" : "auto"}}>
                    <option value="">Min</option>
                    {minutes.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <select
                    id="toPeriod"
                    style={{ padding: 6, flex: 1,minWidth: isMobile ? "30%" : "auto" }}
                    onChange={() => {
                      const fh = (document.getElementById("fromHour") as HTMLSelectElement).value;
                      const fm = (document.getElementById("fromMinute") as HTMLSelectElement).value;
                      const fp = (document.getElementById("fromPeriod") as HTMLSelectElement).value;

                      const th = (document.getElementById("toHour") as HTMLSelectElement).value;
                      const tm = (document.getElementById("toMinute") as HTMLSelectElement).value;
                      const tp = (document.getElementById("toPeriod") as HTMLSelectElement).value;

                      const formattedFrom = formatTime(fh, fm, fp);
                      const formattedTo = formatTime(th, tm, tp);

                      setFromTime(formattedFrom);
                      setToTime(formattedTo);

                      // ✅ Save filters so layout stays after reload
                      setShowTimeDropdown(false);
                    }}
                  >
                    <option value="">AM/PM</option>
                    {periods.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* PARKING SELECT */}
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 14,
            minWidth: 120,
            gridColumn: isMobile ? "span 2" : "auto"
          }}
        >
          {areas.map((area: any) => (
            <option key={area.area_id} value={String(area.area_id)}>
              {area.Area_name}
            </option>
          ))}
        </select>

      </div>
    </div>
  );
}