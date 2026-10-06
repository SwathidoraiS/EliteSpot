import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  normalFromDate: Date | null;
  setNormalFromDate: (value: Date | null) => void;
  normalToDate: Date | null;
  setNormalToDate: (value: Date | null) => void;
  fromTime: string;
  toTime: string;
  setFromTime: (value: string) => void;
  setToTime: (value: string) => void;
  selectedArea: string;
  setSelectedArea: (value: string) => void;
  isMobile: boolean;
  isEditMode: boolean;
  // Business Trip
  isBusinessTrip: boolean;
  setIsBusinessTrip: (value: boolean) => void;
  businessFromDate: Date | null;
  setBusinessFromDate: (value: Date | null) => void;
  businessToDate: Date | null;
  setBusinessToDate: (value: Date | null) => void;
  businessFromTime: string;
  setBusinessFromTime: (value: string) => void;
  businessToTime: string;
  setBusinessToTime: (value: string) => void;
};

export default function FilterBar({
  selectedDate,
  setSelectedDate,
  normalFromDate,
  setNormalFromDate,
  normalToDate,
  setNormalToDate,
  fromTime,
  toTime,
  setFromTime,
  setToTime,
  selectedArea,
  setSelectedArea,
  isMobile,
  isEditMode,
  isBusinessTrip,
  setIsBusinessTrip,
  businessFromDate,
  setBusinessFromDate,
  businessToDate,
  setBusinessToDate,
  businessFromTime,
  setBusinessFromTime,
  businessToTime,
  setBusinessToTime,
}: Props) {

  const { t } = useTranslation();

  const normalDateTimeRef = useRef<HTMLDivElement | null>(null);

  const [showBusinessTripPicker, setShowBusinessTripPicker] = useState(false);

  const businessTripRef = useRef<HTMLDivElement | null>(null);
  
  //const [fullDay, setFullDay] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // 📅 Date limits
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(todayStart.getDate() + 1);
  const dayAfterTomorrow = new Date(todayStart);
  dayAfterTomorrow.setDate(todayStart.getDate() + 2);
  const today = todayStart;

  const [showNormalDateTimePicker, setShowNormalDateTimePicker] = useState(false);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const isValidDate = (date: Date | null): date is Date => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  const formatBusinessDateDisplay = (date: Date | string | null) => {

    if (!date) return "";

    const dateObj =

      date instanceof Date

        ? date

        : new Date(`${date}T00:00:00`);

    // Prevent "Invalid Date"

    if (isNaN(dateObj.getTime())) {

      return "";

    }

    return dateObj.toLocaleDateString("en-US", {

      month: "short",

      day: "2-digit",

      year: "numeric",

    });

  };


  const minDate = formatDate(todayStart);
  const maxDate = formatDate(dayAfterTomorrow);

  // 📅 Set default date
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(minDate);
    }
    if (!isValidDate(normalFromDate)) {
      setNormalFromDate(todayStart);
    }
    if (!isValidDate(normalToDate)) {
      setNormalToDate(todayStart);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        normalDateTimeRef.current &&
        !normalDateTimeRef.current.contains(event.target as Node)
      ) {
        setShowNormalDateTimePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        businessTripRef.current &&
        !businessTripRef.current.contains(event.target as Node)
      ) {
        setShowBusinessTripPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ⏰ Time options
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minutes = ["00", "15", "30", "45"];

  return (
    <div style={containerStyle}>
      {/* Business Trip Checkbox */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: 8,
        }}
      >
        <input
          type="checkbox"
          id="businessTrip"
          checked={isBusinessTrip}
          disabled={isEditMode}
          onChange={(e) => setIsBusinessTrip(e.target.checked)}
          style={{
            width: "15px",
            height: "15px",
            cursor: isEditMode ? "not-allowed" : "pointer",
          }}
        />
        <label
          htmlFor="businessTrip"
          style={{
            fontSize: "12px",
            fontWeight: 500,
            cursor: "pointer",
            color: "#333",
          }}
        >
          {t("Bookingformorethanday")}
        </label>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "minmax(0, 1fr) minmax(0, 1fr)" 
            : "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)",
          gap: 15,
          alignItems: "center",
        }}
      >
        {/* 📅 NORMAL DATE + TIME */}
        {!isBusinessTrip ? (
          <div
            ref={normalDateTimeRef}
            style={{
              position: "relative",
              overflow: "visible",
              width: isMobile ? "100%" : 380,
            }}
          >
            {/* NORMAL BOOKING SUMMARY / DROPDOWN */}
            <div
              onClick={() =>
                setShowNormalDateTimePicker(!showNormalDateTimePicker)
              }
              style={{
                ...dropdownTrigger,
                height: 33,
                display: "flex",
                alignItems: "center",
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {normalFromDate &&
                  normalToDate &&
                  fromTime &&
                  toTime
                  ? `${formatBusinessDateDisplay(
                    normalFromDate
                  )} ${fromTime} → ${formatBusinessDateDisplay(
                    normalToDate
                  )} ${toTime}`
                  : "Select date & time"}
              </span>
              <span style={{ fontSize: 12 }}>▼</span>
            </div>
            {/* NORMAL DATE + TIME POPUP */}
            {showNormalDateTimePicker && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  width: isMobile ? "260px" : "300px",
                  maxWidth: "calc(100vw - 24px)",
                  background: "#fff",
                  padding: "12px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  zIndex: 9999,
                  boxSizing: "border-box",
                }}
              >
                {/* ================= FROM ================= */}
                <div style={{ marginBottom: 15 }}>
                  <label
                    style={{
                      ...labelStyle,
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    From
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      width: "100%",
                    }}
                  >
                    {/* FROM DATE */}
                    <div style={{ width: "50%" }}>
                      
                      <DatePicker
                        selected={isValidDate(normalFromDate) ? normalFromDate : null}
                        onChange={(date: Date | null) => {
                          console.log("date:",date);
                          if (!date || isNaN(date.getTime())) return;
                          const selected = new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate()
                          );
                          console.log("NORMAL FROM DATE SELECTED:", selected);
                          setNormalFromDate(selected);
                          if (
                            normalToDate instanceof Date &&
                            !isNaN(normalToDate.getTime()) &&
                            normalToDate < selected
                          ) {
                            setNormalToDate(selected);
                          }
                        }}
                        minDate={todayStart}
                        maxDate={dayAfterTomorrow}
                        dateFormat="MMM dd, yyyy"
                        placeholderText="Date"
                        customInput={
                          <input
                            type="text"
                            style={businessDateInputStyle}
                          />
                        }
                      />
                    </div>
                    {/* FROM TIME */}
                    <select
                      value={fromTime}
                      onChange={(e) =>
                        setFromTime(e.target.value)
                      }
                      style={{
                        ...selectStyle,
                        width: "50%",
                        minWidth: 0,
                        height: 34,
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="">Time</option>
                      {hours.map((hour) =>
                        minutes.map((minute) => {
                          const value = `${hour}:${minute}`;
                          return (
                            <option
                              key={value}
                              value={value}
                            >
                              {value}
                            </option>
                          );
                        })
                      )}
                    </select>
                  </div>
                </div>

                {/* ================= TO ================= */}
                <div>
                  <label
                    style={{
                      ...labelStyle,
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    To
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      width: "100%",
                    }}
                  >
                    {/* TO DATE */}
                    <div style={{ width: "50%" }}>
                      <DatePicker
                        selected={isValidDate(normalToDate)
                            ? normalToDate
                            : null
                        }
                        onChange={(date: Date | null) => {
                          if (!date || isNaN(date.getTime())) return;
                          const selected = new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate()
                          );
                          console.log("NORMAL TO DATE SELECTED:", selected);
                          setNormalToDate(selected);
                        }}
                        minDate={
                          normalFromDate instanceof Date &&
                            !isNaN(normalFromDate.getTime())
                            ? normalFromDate
                            : todayStart
                        }
                        maxDate={dayAfterTomorrow}
                        dateFormat="MMM dd, yyyy"
                        placeholderText="Date"
                        customInput={
                          <input
                            type="text"
                            style={businessDateInputStyle}
                          />
                        }
                      />
                    </div>
                    {/* TO TIME */}
                    <select
                      value={toTime}
                      onChange={(e) =>
                        setToTime(e.target.value)
                      }
                      style={{
                        ...selectStyle,
                        width: "50%",
                        minWidth: 0,
                        height: 34,
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="">Time</option>
                      {hours.map((hour) =>
                        minutes.map((minute) => {
                          const value = `${hour}:${minute}`;
                          return (
                            <option
                              key={value}
                              value={value}
                            >
                              {value}
                            </option>
                          );
                        })
                      )}
                    </select>
                  </div>
                </div>

                {/* ================= DONE ================= */}
                <button
                  type="button"
                  onClick={() => {
                    if (
                      !normalFromDate ||
                      !fromTime ||
                      !normalToDate ||
                      !toTime
                    ) {
                      Swal.fire({
                        icon: "warning",
                        title: "Incomplete",
                        text:
                          "Please select From and To date and time.",
                      });
                      return;
                    }
                    // Same date → To time must be later
                    if (
                      formatDate(normalFromDate) ===
                      formatDate(normalToDate) &&
                      toTime <= fromTime
                    ) {
                      Swal.fire({
                        icon: "warning",
                        title: "Invalid Time",
                        text:
                          "To time must be later than From time.",
                      });
                      return;
                    }
                    // Save From date to your existing selectedDate
                    setSelectedDate(
                      formatDate(normalFromDate)
                    );
                    setShowNormalDateTimePicker(false);
                  }}
                  style={{
                    marginTop: 15,
                    width: "100%",
                    height: 38,
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: 6,
                    background: "#333",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        ) : (
          /* 🚗 BUSINESS TRIP */
          <div
            ref={businessTripRef}
            style={{
              position: "relative",
              overflow: "visible",
              width: isMobile ? "100%" : 380,
            }}
          >

            {/* TRIP PERIOD BUTTON */}
            <div
              onClick={() =>
                setShowBusinessTripPicker(!showBusinessTripPicker)
              }
              style={{
                ...dropdownTrigger,
                height: 33,
                display: "flex",
                alignItems: "center",
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  width: isMobile ? "130px" : "100%",
                  fontSize: 12,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {businessFromDate &&
                  businessFromTime &&
                  businessToDate &&
                  businessToTime
                  ? `${formatBusinessDateDisplay(
                    businessFromDate
                  )} ${businessFromTime} → ${formatBusinessDateDisplay(
                    businessToDate
                  )} ${businessToTime}`
                  : t("selectTripPeriod")}
              </span>
              <span style={{ fontSize: 12 }}>▼</span>
            </div>
            {/* BUSINESS TRIP POPUP */}
            {showBusinessTripPicker && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  width: isMobile ? "260px" : "300px",
                  maxWidth: "calc(100vw-24px)",
                  background: "#fff",
                  padding: "12px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  zIndex: 9999,
                  boxSizing: "border-box",
                }}
              >
                {/* ================= FROM ================= */}
                <div style={{ marginBottom: 15 }}>
                  <label
                    style={{
                      ...labelStyle,
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    From
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      width: "100%",
                    }}
                  >
                    {/* FROM DATE */}
                    <div
                      style={{
                        width: "50%",
                      }}
                    >
                      <DatePicker
                        selected={businessFromDate}
                        onChange={(date: Date | null) => {
                          setBusinessFromDate(date);
                          // If To Date becomes earlier
                          // than From Date, clear To Date
                          if (
                            date &&
                            businessToDate &&
                            businessToDate < date
                          ) {
                            setBusinessToDate(null);
                          }
                        }}
                        minDate={todayStart}
                        dateFormat="MMM dd, yyyy"
                        placeholderText="Date"
                        customInput={
                          <input
                            type="text"
                            style={businessDateInputStyle}
                          />
                        }
                      />
                    </div>
                    {/* FROM TIME */}
                    <select
                      value={businessFromTime}
                      onChange={(e) =>
                        setBusinessFromTime(e.target.value)
                      }
                      style={{
                        ...selectStyle,
                        width: "50%",
                        minWidth: 0,
                        height: 34,
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="">Time</option>
                      {hours.map((hour) =>
                        minutes.map((minute) => {
                          const value = `${hour}:${minute}`;
                          return (
                            <option
                              key={value}
                              value={value}
                            >
                              {value}
                            </option>
                          );
                        })
                      )}
                    </select>
                  </div>
                </div>
                {/* ================= TO ================= */}
                <div>
                  <label
                    style={{
                      ...labelStyle,
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    To
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      width: "100%",
                    }}
                  >
                    {/* TO DATE */}
                    <div
                      style={{
                        width: "50%",
                      }}
                    >
                      <DatePicker
                        selected={businessToDate}
                        onChange={(date: Date | null) => {
                          setBusinessToDate(date);
                        }}
                        minDate={businessFromDate || todayStart}
                        dateFormat="MMM dd, yyyy"
                        placeholderText="Date"
                        customInput={
                          <input
                            type="text"
                            style={businessDateInputStyle}
                          />
                        }
                      />
                    </div>
                    {/* TO TIME */}
                    <select
                      value={businessToTime}
                      onChange={(e) =>
                        setBusinessToTime(e.target.value)
                      }
                      style={{
                        ...selectStyle,
                        width: "50%",
                        minWidth: 0,
                        height: 34,
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="">Time</option>
                      {hours.map((hour) =>
                        minutes.map((minute) => {
                          const value = `${hour}:${minute}`;
                          return (
                            <option
                              key={value}
                              value={value}
                            >
                              {value}
                            </option>
                          );
                        })
                      )}
                    </select>
                  </div>
                </div>
                {/* ================= DONE ================= */}
                <button
                  type="button"
                  onClick={() => {
                    // Check all fields
                    if (
                      !businessFromDate ||
                      !businessFromTime ||
                      !businessToDate ||
                      !businessToTime
                    ) {
                      Swal.fire({
                        icon: "warning",
                        title: "Incomplete",
                        text:
                          "Please select From and To date and time.",
                      });
                      return;
                    }
                    // Same date → To time must be later
                    if (
                      businessFromDate.getTime() ===
                      businessToDate.getTime() &&
                      businessToTime <= businessFromTime
                    ) {
                      Swal.fire({
                        icon: "warning",
                        title: "Invalid Time",
                        text:
                          "To time must be later than From time.",
                      });
                      return;
                    }
                    // Valid
                    setShowBusinessTripPicker(false);
                  }}
                  style={{
                    marginTop: 15,
                    width: "100%",
                    height: 38,
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: 6,
                    background: "#333",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}


        {/* 📍 AREA SELECT */}

        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          style={{
            ...inputStyle,
            minWidth: 120,
            gridColumn: "auto",
          }}
        >
          <option value="R">{t("rParking")}</option>
        </select>

      </div>
    </div >
  );
}

/* 🎨 STYLES */

const containerStyle = {
  background: "linear-gradient(145deg, #ffffff, #f3f6f9)",
  padding: "12px 16px",
  borderRadius: 14,
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  marginBottom: 10,
};

const businessDateInputStyle = {
  width: "100%",
  height: 34,
  padding: "8px 6px",
  fontSize: 14,
  boxSizing: "border-box" as const,
};

const inputStyle = {
  height: 33,
  border: "1px solid #ccc",
  borderRadius: 6,
  fontSize: 12,
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
  overflowY: "auto" as const,     // ⬅️ enables scroll only for hour list
  maxHeight: "30vh",     // ⬅️ limits height of hour list
};

const timeRow = (isMobile: boolean) => ({
  display: "flex",
  gap: 6,
  flexWrap: isMobile ? "wrap" as const : "nowrap" as const,
});