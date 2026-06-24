import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 📦 Types
type Area = {
  area_id: number;
  Area_name: string;
};

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
  isMobile,
}: Props) {

  const { t } = useTranslation();
  // ⏱ Time dropdown state
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [openFromHour, setOpenFromHour] = useState(false)

  // 📍 Parking areas
  const [areas, setAreas] = useState<Area[]>([]);

  // ⏳ Loading state
  const [loadingAreas, setLoadingAreas] = useState(true);

  // ⏰ Time selection states (NO DOM ACCESS)
  const [fromHour, setFromHour] = useState("");
  const [fromMinute, setFromMinute] = useState("");
  const [toHour, setToHour] = useState("");
  const [toMinute, setToMinute] = useState("");

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // 📅 Date limits
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const minDate = formatDate(today);
  const maxDate = formatDate(tomorrow);

  // 📅 Set default date
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(minDate);
    }
  }, []);

  useEffect(() => {
  if (showTimeDropdown && dropdownRef.current) {
    const rect = dropdownRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.top;

    if (spaceBelow < 250) {
      dropdownRef.current.style.top = "auto";
      dropdownRef.current.style.bottom = "45px";
    } else {
      dropdownRef.current.style.top = "45px";
      dropdownRef.current.style.bottom = "auto";
    }
  }
}, [showTimeDropdown]);


  // 📡 Fetch parking areas
  const fetchAreas = async () => {
    try {
      setLoadingAreas(true);

      const res = await fetch(`${BASE_URL}/parking-areas`);
      const data = await res.json();

      if (Array.isArray(data?.data)) {
        setAreas(data.data);

        if (data.data.length > 0) {
          setSelectedArea(String(data.data[0].area_id));
        }
      } else {
        setAreas([]);
      }
    } catch (err) {
      console.error("Failed to load parking areas", err);
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  // ⏱ Update time when all values selected
  useEffect(() => {
    if (fromHour && fromMinute && toHour && toMinute) {
      const formattedFrom = `${fromHour}:${fromMinute}`;
      const formattedTo = `${toHour}:${toMinute}`;

      setFromTime(formattedFrom);
      setToTime(formattedTo);
      setShowTimeDropdown(false);
    }
  }, [fromHour, fromMinute, toHour, toMinute]);

  // 🖱 Close dropdown when clicking outside
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⏰ Time options
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minutes = ["00", "15", "30", "45"];

  const dropdownBox = {
  position: "absolute" as const,
  top: "calc(100% + 6px)",
  left: 0,
  width: isMobile ? "90vw" : 240,
  maxHeight: "60vh",
  overflowY: "auto",
  background: "#fff",
  padding: 15,
  borderRadius: 10,
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  zIndex: 100,
};

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "auto auto auto",
          gap: 15,
          alignItems: "center",
        }}
      >
        {/* 📅 DATE */}
        <input
          type="date"
          min={minDate}
          max={maxDate}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={inputStyle}
        />

        {/* ⏱ TIME */}
        <div style={{ position: "relative" }}>
  <div
    onClick={() => setShowTimeDropdown(!showTimeDropdown)}
    style={dropdownTrigger}
  >
    <span>
      {fromTime && toTime ? `${fromTime} - ${toTime}` : t("select_time")}
    </span>
    <span style={{ fontSize: 12 }}>▼</span>
  </div>

  {showTimeDropdown && (
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: isMobile ? "calc(100% + 8px)" : "calc(100% + 6px)",
        left: isMobile ? "50%" : 0,
        transform: isMobile ? "translateX(-50%)" : "none",
        width: isMobile ? "60vw" : 240,
        background: "#fff",
        padding: 15,
        borderRadius: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        zIndex: 100,
      }}
    >
      {/* FROM */}
      <div style={{ marginBottom: 15 }}>
        <label style={labelStyle}>{t("from")}</label>

        <div style={timeRow(isMobile)}>
          {/* Hour scrollable */}
          <select
            value={fromHour}
            onChange={(e) => setFromHour(e.target.value)}
            style={{
              ...selectStyle,
              maxHeight: "30vh",
              overflowY: "auto",
            }}
          >
            <option value="">{t("hour")}</option>
            {hours.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>

          {/* Minute normal */}
          <select
            value={fromMinute}
            onChange={(e) => setFromMinute(e.target.value)}
            style={selectStyle}
          >
            <option value="">{t("minute")}</option>
            {minutes.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TO */}
      <div>
        <label style={labelStyle}>{t("to")}</label>

        <div style={timeRow(isMobile)}>
          {/* Hour scrollable */}
          <select
            value={toHour}
            onChange={(e) => setToHour(e.target.value)}
            style={{
              ...selectStyle,
              maxHeight: "30vh",
              overflowY: "auto",
            }}
          >
            <option value="">{t("hour")}</option>
            {hours.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>

          {/* Minute normal */}
          <select
            value={toMinute}
            onChange={(e) => setToMinute(e.target.value)}
            style={selectStyle}
          >
            <option value="">{t("minute")}</option>
            {minutes.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )}
</div>


        {/* 📍 AREA SELECT */}
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          style={{
            ...inputStyle,
            minWidth: 120,
            gridColumn: isMobile ? "span 2" : "auto",
          }}
        >
          {loadingAreas ? (
            <option>Loading...</option>
          ) : areas.length === 0 ? (
            <option>No Areas</option>
          ) : (
            areas.map((area) => (
              <option key={area.area_id} value={area.Area_name}>
                {area.Area_name}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
}

/* 🎨 STYLES */

const containerStyle = {
  background: "linear-gradient(145deg, #ffffff, #f3f6f9)",
  padding: "16px 20px",
  borderRadius: 14,
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  marginBottom: 10,
};

const inputStyle = {
  padding: "8px 12px",
  border: "1px solid #ccc",
  borderRadius: 6,
  fontSize: 14,
};

const dropdownTrigger = {
  padding: "8px 12px",
  border: "1px solid #ccc",
  borderRadius: 6,
  fontSize: 14,
  background: "#fff",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
};


const labelStyle = {
  fontSize: 13,
};

const selectStyle = {
  padding: 6,
  flex: 1,
  height: "auto",
  overflowY: "auto",     // ⬅️ enables scroll only for hour list
  maxHeight: "30vh",     // ⬅️ limits height of hour list
};

const timeRow = (isMobile: boolean) => ({
  display: "flex",
  gap: 6,
  flexWrap: isMobile ? "wrap" as const : "nowrap" as const,
});