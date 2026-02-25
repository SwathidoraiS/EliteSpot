import { useState } from "react";

type Props = {
  fromTime: string;
  toTime: string;
  setFromTime: (value: string) => void;
  setToTime: (value: string) => void;
};

export default function FilterBar({
  fromTime,
  toTime,
  setFromTime,
  setToTime
}: Props) {
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "14px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 14,
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        marginBottom: 10,
        marginTop: 3
      }}
    >
      <div style={{ display: "flex", gap: 15 }}>

        {/* DATE */}
        <input
          type="date"
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
              minWidth: 130,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span>{fromTime} - {toTime}</span>
            <span style={{ fontSize: 12 }}>▼</span>
          </div>

          {showTimeDropdown && (
            <div
              style={{
                position: "absolute",
                top: "45px",
                left: 0,
                width: 170,
                background: "#fff",
                padding: 15,
                borderRadius: 10,
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                zIndex: 100
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 13 }}>From</label>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: 6,
                    border: "1px solid #ddd"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13 }}>To</label>
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: 6,
                    border: "1px solid #ddd"
                  }}
                />
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
            minWidth: 140
          }}
        >
          <option>R Parking</option>
        </select>

      </div>
    </div>
  );
}
