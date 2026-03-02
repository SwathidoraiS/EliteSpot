import { useState } from "react";

type Props = {
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  fromTime: string;
  toTime: string;
  setFromTime: (value: string) => void;
  setToTime: (value: string) => void;
};

export default function FilterBar({
  selectedDate,
  setSelectedDate,
  fromTime,
  toTime,
  setFromTime,
  setToTime
}: Props) {
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  // 1–12 hours
  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  const minutes = ["00", "15", "30", "45"];
  const periods = ["AM", "PM"];

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
          "0 6px 18px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
        marginBottom: 10
      }}
    >
      <div style={{ display: "flex", gap: 15 }}>

        {/* DATE */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
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
              border: "1px solid #ccc",
              borderRadius: 6,
              background: "#fff",
              cursor: "pointer",
              minWidth: 110,
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
              style={{
                position: "absolute",
                top: "45px",
                left: 0,
                width: 200,
                background: "#fff",
                padding: 15,
                borderRadius: 10,
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                zIndex: 100
              }}
            >
              {/* FROM */}
              <div style={{ marginBottom: 15 }}>
                <label style={{ fontSize: 13 }}>From</label>

                <div style={{ display: "flex", gap: 6 }}>
                  <select id="fromHour" style={{ padding: 6 }}>
                    <option value="">Hours</option>
                    {hours.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>

                  <select id="fromMinute" style={{ padding: 6 }}>
                    <option value="">Min</option>
                    {minutes.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <select id="fromPeriod" style={{ padding: 6 }}>
                    
                    {periods.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TO */}
              <div>
                <label style={{ fontSize: 13 }}>To</label>

                <div style={{ display: "flex", gap: 6 }}>
                  <select id="toHour" style={{ padding: 6 }}>
                    <option value="">Hours</option>
                    {hours.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>

                  <select id="toMinute" style={{ padding: 6 }}>
                    <option value="">Min</option>
                    {minutes.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <select
                    id="toPeriod"
                    style={{ padding: 6 }}
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

                      setShowTimeDropdown(false); // auto close
                    }}
                  >
                    
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
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 14,
            minWidth: 120
          }}
        >
          <option>R Parking</option>
        </select>

      </div>
    </div>
  );
}