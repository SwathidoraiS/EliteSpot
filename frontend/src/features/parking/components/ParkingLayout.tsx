import { useState, useEffect } from "react";
import { initialSlots } from "../data/parkingLayout";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import UserMenu from "./UserMenu";
import Swal from "sweetalert2";
import {
  fetchLayout,
  createBooking,
  cancelBooking as cancelBookingAPI,
  fetchMyBookings
} from "../../../services/parkingService";

import FilterBar from "./FilterBar";
import Dashboard from "./Dashboard";
import Legend from "./Legend";
import ParkingCanvas from "./ParkingCanvas";

// ============== COMPONENTS ==============
export default function ParkingLayout() {
  // ================= STATE =================
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ja" : "en";
    i18n.changeLanguage(newLang);

    // optional: persist language
    localStorage.setItem("lang", newLang);
  };;

  const [slots, setSlots] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const navigate = useNavigate();
  const bookingTimeout = useRef<NodeJS.Timeout | null>(null);
  const username = localStorage.getItem("username") || "";
  const [selectedArea, setSelectedArea] = useState("2");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  // ================= UTILITIES =================
  // Convert 12hr → 24hr
  const convertTo24Hour = (time: string) => {
    if (!time) return "";

    const [t, period] = time.split(" ");
    let [hours, minutes] = t.split(":").map(Number);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const formatDate = (dateTime: string) => {
  if (!dateTime) return "";

  return dateTime.split("T")[0];
};
  

  const getNextQuarterHour = () => {
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();

    // Round up to next 15 minutes
    minutes = Math.ceil(minutes / 15) * 15;

    if (minutes === 60) {
      minutes = 0;
      hours += 1;
    }

    if (hours === 24) {
      hours = 0;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    return () => {
        if (bookingTimeout.current) {
            clearTimeout(bookingTimeout.current);
        }
    };
}, []);

  // Extract HH:mm from datetime
  const formatTime = (dateTime: string) => {
    if (!dateTime) return "";

    const timePart = dateTime.split("T")[1] || dateTime.split(" ")[1];
    const [hours, minutes] = timePart.split(":");

    return `${hours.padStart(2, "0")}:${minutes}`;
  };

    useEffect(() => {
  console.log("myBookings:", myBookings);
}, [myBookings]);

  // ================= INIT =================
  // Load saved filters
  useEffect(() => {
    const savedDate = localStorage.getItem("selectedDate");
    const savedFrom = localStorage.getItem("fromTime");
    const savedTo = localStorage.getItem("toTime");

    if (savedDate) {
        setSelectedDate(savedDate);
    } else {
        const today = getToday();
        setSelectedDate(today);
        localStorage.setItem("selectedDate", today);
    }

    if (savedFrom && savedTo) {
        setFromTime(savedFrom);
        setToTime(savedTo);
    } else {
        const currentTime = getNextQuarterHour();

        setFromTime(currentTime);
        localStorage.setItem("fromTime", currentTime);

        // Default end time = 15 minutes later
        const [h, m] = currentTime.split(":").map(Number);

        let endHour = h;
        let endMinute = m + 15;

        if (endMinute === 60) {
            endMinute = 0;
            endHour += 1;
        }

        if (endHour === 24) {
            endHour = 0;
        }

        const endTime =
            `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

        setToTime(endTime);
        localStorage.setItem("toTime", endTime);
    }

    setFiltersLoaded(true);
  }, []);

  // Detect mobile
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Load bookings first
  useEffect(() => {
    checkUserBooking();
  }, []);

  /* ================= MAIN LOGIC ================= */
  useEffect(() => {
    if (!filtersLoaded || !bookingsLoaded) return;
    if (!selectedDate || !fromTime || !toTime) return;

    const now = new Date();

    const selected = new Date(
      `${selectedDate}T${convertTo24Hour(fromTime)}:00`
    );

    const hasActiveBooking = myBookings.some(
      (b) => b.status === "BOOKED" || b.status === "PARKED"
    );

    if (!hasActiveBooking && selected < now) {
      Swal.fire({
        icon: "error",
        title: t("invalidTime"),
        text: t("cannotSelectPastTimeSlot"),
        confirmButtonColor: "#095e6d",
      });
      return;
    }

    loadLayout();
  }, [selectedDate, fromTime, toTime, selectedArea, filtersLoaded,myBookings, bookingsLoaded]);

  /* ================= AUTO REFRESH ================= */
  useEffect(() => {
    if (!selectedDate || !fromTime || !toTime) return;

    const interval = setInterval(async () => {
      try {
        await loadMyBookings();   
        await loadLayout();       
      } catch (err) {
        console.error("Auto refresh failed", err);
      }
    }, 15000); // every 15 seconds

    return () => clearInterval(interval);
  }, [selectedDate, fromTime, toTime, selectedArea]);
 
  /* ================= API LOGIC ================= */

  // Load Layout
 
  const loadLayout = async () => {
    try {
      console.log("Selected Area:", selectedArea);

      console.log("🔄 loadLayout called");
      console.log("Current myBookings:", myBookings);

      const layoutData = await fetchLayout(
        selectedArea,
        selectedDate,
        fromTime,
        toTime
      );
      console.log("Layout Slots:", layoutData?.data?.slots);
      console.log("Full Layout Response:", layoutData);
      console.log(
  "Booked Slots From Backend:",
  layoutData?.data?.slots?.filter(
    (s: any) =>
      s.status?.toUpperCase() === "BOOKED" ||
      s.status?.toUpperCase() === "RESERVED" ||
      s.status?.toUpperCase() === "PARKED"
  )
);
console.log("layoutData", layoutData.data);
      
      const updatedSlots = initialSlots.map((layoutSlot) => {
        const backendSlot = layoutData?.data?.slots?.find(
          (s: any) => String(s.slot_id) === String(layoutSlot.id)
        );

        console.log(
  layoutSlot.id,
  backendSlot
);

        

        let state: "available" | "fixed" | "reserved" | "parked" = layoutSlot.status;

       const myBooking = myBookings.find((b: any) => {

  console.log("Comparing:", {
    layoutSlot: layoutSlot.id,
    bookingSlot: b.slot_id,
    bookingStatus: b.status
  });

  if (
    String(b.slot_id) !== String(layoutSlot.id) ||
    (b.status !== "BOOKED" && b.status !== "PARKED")
  ) return false;

  const bookingDate = b.booking_start.split("T")[0];
const bookingFrom = formatTime(b.booking_start);
const bookingTo = formatTime(b.booking_end);

return (
  bookingDate === selectedDate &&
  bookingFrom === convertTo24Hour(fromTime) &&
  bookingTo === convertTo24Hour(toTime)
);
});

        if (myBooking) {
          state = myBooking.status === "BOOKED" ? "reserved" : "parked";
        } else if (backendSlot) {
            if (backendSlot.status === "reserved" || backendSlot.status === "BOOKED") {
              state = "reserved";
            } 
            else if (
              backendSlot.status === "parked" ||
              backendSlot.status === "PARKED"
            ) {
              state = "parked";
            } 
        else {
          state = "available"; // ✅ IMPORTANT
        }

        }
        if (layoutSlot.id === "21-C5") {
          console.log("==== STATE CHECK ====");
          console.log({
            myBooking,
            backendSlot,
            finalState: state,
          });
        }
        return {
          ...layoutSlot,
          state,
        };
      });
      setSlots(updatedSlots);
      } catch (error) {
        console.error("Layout fetch failed", error);
      }
    };

    // Check User Booking
    const checkUserBooking = async () => {
      try {
        const data = await fetchMyBookings();

        const activeBookings = data.bookings.filter(
          (b: any) => b.status === "BOOKED" || b.status === "PARKED"
        );

        setMyBookings(activeBookings);

        // Auto load filters from booking
        if (activeBookings.length > 0) {
          const booking = activeBookings[0];

          const bookingDate = booking.booking_start.split("T")[0];

          const from = formatTime(booking.booking_start);
          const to = formatTime(booking.booking_end);

          setSelectedDate(bookingDate);
          setFromTime(from);
          setToTime(to);

          localStorage.setItem("selectedDate", bookingDate);
          localStorage.setItem("fromTime", from);
          localStorage.setItem("toTime", to);

          // Schedule automatic refresh when booking ends
          const bookingEnd = new Date(booking.booking_end);
          const now = new Date();

          const delay = bookingEnd.getTime() - now.getTime();

          if (bookingTimeout.current) {
              clearTimeout(bookingTimeout.current);
          }

          if (delay > 0) {
              bookingTimeout.current = setTimeout(() => {
                  console.log("Booking expired. Refreshing...");
                  checkUserBooking();
              }, delay);
          }
        }
        else {
  const now = new Date();

  const today = now.toISOString().split("T")[0];

  setSelectedDate(today);

  // Get current time slot
  const currentHour = now.getHours();

  let from = "";
  let to = "";

  if (currentHour < 1) {
    from = "01:00";
    to = "02:00";
  } 
  else if (currentHour < 2) {
    from = "02:00";
    to = "03:00";
  }
  else if (currentHour < 3) {
    from = "03:00";
    to = "04:00";
  }
  else if (currentHour < 4) {
    from = "04:00";
    to = "05:00";
  }
  else if (currentHour < 5) {
    from = "05:00";
    to = "06:00";
  }
  else if (currentHour < 6) {
    from = "06:00";
    to = "07:00";
  } else if (currentHour < 7) {
    from = "07:00";
    to = "08:00";
  }
  else if (currentHour < 8) {
    from = "08:00";
    to = "09:00";
  }
  else if (currentHour < 9) {
    from = "09:00";
    to = "10:00";
  }
  else if (currentHour < 10) {
    from = "10:00";
    to = "11:00";
  }
  else if (currentHour < 11) {
    from = "11:00";
    to = "12:00";
  }
  else if (currentHour < 12) {
    from = "12:00";
    to = "13:00";
  }
  else if (currentHour < 13) {
    from = "13:00";
    to = "14:00";
  }
  else if (currentHour < 14) {
    from = "14:00";
    to = "15:00";
  }
  else if (currentHour < 15) {
    from = "15:00";
    to = "16:00";
  }
  else if (currentHour < 16) {
    from = "16:00";
    to = "17:00";
  }
  else if (currentHour < 17) {
    from = "17:00";
    to = "18:00";
  }
  else if (currentHour < 18) {
    from = "18:00";
    to = "19:00";
  }
  else if (currentHour < 19) {
    from = "19:00";
    to = "20:00";
  }
  else if (currentHour < 20) {
    from = "20:00";
    to = "21:00";
  }
  else if (currentHour < 21) {
    from = "21:00";
    to = "22:00";
  }
  else if (currentHour < 22) {
    from = "22:00";
    to = "23:00";
  }
  else if (currentHour < 23) {
    from = "23:00";
    to = "24:00";
  }
  else {
    from = "24:00";
    to = "1:00";
  }

  setSelectedDate(today);
  setFromTime(from);
  setToTime(to);

  localStorage.setItem("selectedDate", today);
  localStorage.setItem("fromTime", from);
  localStorage.setItem("toTime", to);
}

        setBookingsLoaded(true);

      } catch (error) {
        console.error("Booking check failed", error);
        setBookingsLoaded(true);
      }
    };

    // Load My Bookings
    const loadMyBookings = async () => {
      try {
        const data = await fetchMyBookings();

        const activeBookings = data.bookings.filter(
          (b: any) => b.status === "BOOKED" || b.status === "PARKED"
        );

        setMyBookings(activeBookings);

      } catch (error) {
        console.error("Booking fetch failed", error);
      }
    };

    /* ================= UI ACTIONS ================= */
    // handle Slot Click
    const handleSlotClick = (id: string) => {
      const hasActiveBooking = myBookings.some(
        b => b.status === "BOOKED" || b.status === "PARKED"
      );

      if (hasActiveBooking) {
        alert(t("cancelExistingBookingFirst"));
        return;
      }

      const clicked = slots.find(s => s.id === id);
      if (!clicked) return;

      if (["reserved", "parked", "fixed"].includes(clicked.state)) {
        alert("Slot not available");
        return;
      }

      setSlots(prev =>
        prev.map(slot => {
          if (slot.id === id) {
            return {
              ...slot,
              state: slot.state === "selected" ? "available" : "selected"
            };
          }

          if (slot.state === "selected") {
            return { ...slot, state: "available" };
          }

          return slot;
        })
      );

      setSelectedSlotId(prev => (prev === id ? null : id));
    };
    
    //handle Confirm
    const handleConfirm = async () => {
      const missingFields = [];

if (!selectedSlotId) missingFields.push(t("slot"));
if (!selectedDate) missingFields.push(t("date"));
if (!fromTime || !toTime) missingFields.push(t("time"));

if (missingFields.length > 0) {
  await Swal.fire({
    icon: "warning",
    title: t("missingFields"),
    text: `${t("pleaseSelect")} ${missingFields.join(", ")}.`,
    confirmButtonColor: "#095e6d",
  });
  return;
}

      const confirm = await Swal.fire({
        title: t("confirmBooking"),
        text: `${t("slot")} ${selectedSlotId}\n${selectedDate} (${fromTime} - ${toTime})`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#095e6d",
      });

      if (!confirm.isConfirmed) return;

      try {
        const data = await createBooking({
          slotId: selectedSlotId,
          date: selectedDate,
          fromTime,
          toTime,
          plateNumber: "TN09AB1234"
        });

        console.log(data);

        await Swal.fire(t("success"), t("slotBooked"), "success"); 

        if (data.showFeedback) {
          navigate("/feedback");
        }

        setSelectedSlotId(null);

        // Optimistic UI update
        setSlots(prev =>
          prev.map(slot =>
            slot.id === selectedSlotId
              ? { ...slot, state: "reserved" }
              : slot
          )
        );

        await loadMyBookings();
        await loadLayout();

      } catch (err: any) {
        alert(err.message);
      }
    };

    // handle Cancel

    const handleCancel = async (bookingId: string) => {

      const result = await Swal.fire({
        title: t("cancelBooking"),
        text: t("cancelConfirmText"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: t("confirmCancel"),
        cancelButtonText: t("cancel")
      });

      if (!result.isConfirmed) return;
      try {
        await cancelBookingAPI(bookingId);

        Swal.fire(t("cancelled"), t("bookingCancelled"), "success");

        // ✅ REFRESH STATE
        await loadMyBookings();
        await loadLayout();

      } catch (error) {
        console.error(error);
        alert("Cancel failed");
      }
    };

    /* ================= DERIVED ================= */

    const availableCount = slots.filter(
      (slot) => slot.state === "available" || slot.state === "selected"
    ).length;

    const parkedCount = slots.filter(
      (slot) => slot.state === "parked"
    ).length;

    /* ================= UI ================= */

    return (
    <div
      style={{
        width: "100%",
        padding: isMobile ? "12px 16px" : "30px 40px"
      }}
    >
    <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "start",
    width: "100%",
  }}
>
  {/* Left Spacer */}
  <div></div>

  {/* Center */}
  <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }}
>
  <h1
    style={{
      margin: 0,
      fontSize: isMobile ? 18 : 20,
      fontWeight: 700,
    }}
  >
    {t("app_name")}
  </h1>

  {/* Desktop */}
  {!isMobile && (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: -27, // adjust if needed,
      marginRight:-790,
      marginBottom:10,
    }}
  >
    <span
      style={{
        fontSize: 14,
        fontWeight: 700,
      }}
    >
      {t("Welcome")}, {username}!
    </span>
    </div>
  )}

  {/* Mobile */}
  {isMobile && (
    <span
      style={{
        marginTop: 4,
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      {t("Welcome")}, {username}!
    </span>
  )}
</div>

  {/* Right */}
  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 4,
    }}
  >
    <div className="header-actions">
      <UserMenu />

    <div className="language-switch-headers">
      <button onClick={toggleLanguage}>
        {i18n.language === "en" ? "日本語" : "EN"}
      </button>
    </div>
    </div>
    
  </div>

  {/* Right Spacer */}
  <div></div>
</div>
    <FilterBar
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      fromTime={fromTime}
      toTime={toTime}
      setFromTime={setFromTime}
      setToTime={setToTime}
      selectedArea={selectedArea}
      setSelectedArea={setSelectedArea}
      isMobile={isMobile}
    />
    
    {isMobile ? (
      // 📱 MOBILE LAYOUT
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>

        {/* LEFT SIDE */}
        <div style={{ width: "35%", display: "flex", flexDirection: "column", gap: 8 }}>

          <div style={{
            background: "#fff",
            padding: "10px",
            borderRadius: 10,
            fontSize: 10
          }}>
            {t("available_slots")}:{availableCount}
          </div>

          <div style={{
            background: "#fff",
            padding: "10px",
            borderRadius: 10,
            fontSize: 10
          }}>
            {t("parked_slots")}:{parkedCount}
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div style={{ width: "65%" }}>
          <div
            style={{
              background: "linear-gradient(145deg, #ffffff, #f3f6f9)",
              padding: "10px 12px",
              borderRadius: 14,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
            }}
          >
            <h4 style={{ fontSize: 13, margin: "0 0 4px 0" }}>{t("your_bookings")}</h4>

            {myBookings.length === 0 ? (
              <p style={{ fontSize: 12, color: "#777", margin: 0 }}>
                {t("no_bookings")}
              </p>
            ) : (
              myBookings.map((booking) => (
        <div
        key={booking.booking_id}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          marginTop: 6
        }}
      >
        {/* TOP ROW */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          {/* SLOT BADGE */}
          <span
            style={{
              padding: "2px 4px",
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 500,
              background:
                booking.status === "PARKED" ? "#4caf50" : "#ff9800",
              color: "#fff"
            }}
          >
            {booking.slot_id} • {t(booking.status.toLowerCase())}
          </span>

          {/* ✅ CANCEL BUTTON */}
          {booking.status === "BOOKED" && (
            <button
              onClick={() => handleCancel(booking.booking_id)}
              style={{
                background: "#e53935",
                border: "none",
                color: "#fff",
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 10,
                cursor: "pointer"
              }}
            >
              {t("cancel")}
            </button>
          )}
        </div>

        {/* DATE + TIME */}
        <div style={{ fontSize: 11, color: "#555" }}>
          {formatDate(booking.booking_start)} <br />
          {formatTime(booking.booking_start)} - {formatTime(booking.booking_end)}
        </div>
      </div>
      ))
    )}
    </div>
    </div>
    <div style={{ marginBottom: 20 }}>
      <button
        onClick={handleConfirm}
        disabled={!selectedSlotId}
        style={{
          width: "100%",   // 🔥 full width mobile
          background: selectedSlotId
            ? "linear-gradient(135deg, #095e6d, #0b7f8e)"
            : "#cfd8dc",
          color: "#fff",
          padding: "12px",
          border: "none",
          borderRadius: 12,
          cursor: selectedSlotId ? "pointer" : "not-allowed",
          fontSize: 14,
          fontWeight: 600,
          boxShadow: selectedSlotId
            ? "0 6px 18px rgba(0,0,0,0.12)"
            : "none"
        }}
      >
        {t("confirm")}
      </button>
    </div>
    </div>
    ) : (

    // 💻 DESKTOP LAYOUT (YOUR ORIGINAL CODE)
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        gap: 10,
        justifyContent: "space-between",
        marginBottom: 20
      }}
    >
      {/* LEFT SIDE GROUP */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 15,
          width: "100%"
        }}
      >

        {/* Dashboard */}
        <div style={{ display: "flex", gap: 10 }}>
          <Dashboard
            isMobile={isMobile}
            availableCount={availableCount}
            parkedCount={parkedCount}
          />
        </div>

        {/* Your Bookings */}
        <div
          style={{
            background: "linear-gradient(145deg, #ffffff, #f3f6f9)",
            padding: "10px 20px",
            borderRadius: 14,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            width: 220
          }}
        >
          <h4 style={{ fontSize: 12, margin: "0 0 6px 0" }}> {t("your_bookings")}</h4>

          {myBookings.length === 0 ? (
            <p style={{ fontSize: 12, color: "#777", margin: 0 }}>
              {t("no_bookings")}
            </p>
          ) : (
            myBookings.map((booking) => (
        <div
          key={booking.booking_id}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            marginTop: 6
          }}
        >
      {/* TOP ROW */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        {/* SLOT BADGE */}
        <span
          style={{
            padding: "2px 6px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 600,
            background:
              booking.status === "PARKED" ? "#126a9c" : "#2ecc71",
            color: "#fff"
          }}
        >
          {booking.slot_id} • {t(booking.status.toLowerCase())}
        </span>

        {/* ✅ CANCEL BUTTON */}
        {booking.status === "BOOKED" && (
          <button
            onClick={() => handleCancel(booking.booking_id)}
            style={{
              background: "#e53935",
              border: "none",
              color: "#fff",
              padding: "3px 8px",
              borderRadius: 6,
              fontSize: 10,
              cursor: "pointer"
            }}
          >
            {t("cancel")}
          </button>
        )}
      </div>

      {/* DATE + TIME */}
      <div style={{ fontSize: 11, color: "#555" }}>
        {formatDate(booking.booking_start)} <br />
        {formatTime(booking.booking_start)} - {formatTime(booking.booking_end)}
      </div>
    </div>
    ))
    )}
    </div>
    </div>
    {/* Confirm Button */}
    <button
      onClick={handleConfirm}
      disabled={!selectedSlotId}
      style={{
        background: selectedSlotId
          ? "linear-gradient(135deg, #095e6d, #0b7f8e)"
          : "#cfd8dc",
        color: "#fff",
        padding: "12px 28px",   // 🔥 smaller padding
        border: "none",
        borderRadius: 10,       // 🔥 slightly tighter
        cursor: selectedSlotId ? "pointer" : "not-allowed",
        fontSize: 13,          // 🔥 smaller text
        fontWeight: 500,
        height: "fit-content", // 🔥 prevents stretching
        alignSelf: "center",   // 🔥 center vertically
        whiteSpace: "nowrap"   // 🔥 keep text in one line
      }}
    >
      {t("confirm")}
    </button>
    </div>
  )}
  <Legend />

  <div
  style={{
    width: "100%",
    overflowX: isMobile ? "auto" : "hidden",
    paddingBottom: isMobile ? 20 : 0
  }}
  >
  <div
  style={{
    background: "#f7f8f9",
    borderRadius: "24px",
    overflow: "hidden",
    padding: "8px 20px 20px 20px",
    paddingBottom: isMobile ? "10px" : "30px",
   margin: "8px auto 10px auto",  // 👈 gives breathing space
    maxWidth: "1400px"
  }}
  >
  <ParkingCanvas
    slots={slots}
    onSlotClick={handleSlotClick}
    isMobile={isMobile} 
    myBookings={myBookings}
  />
  </div>
</div>
</div>
);
}