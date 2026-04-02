import { useState, useEffect } from "react";
import { initialSlots } from "../data/parkingLayout";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
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
import { CgEnter } from "react-icons/cg";

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

  const [selectedArea, setSelectedArea] = useState("1");
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

    if (savedDate) setSelectedDate(savedDate);
    if (savedFrom) setFromTime(savedFrom);
    if (savedTo) setToTime(savedTo);

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
        title: "Invalid Time",
        text: "You cannot select a past time slot",
        confirmButtonColor: "#095e6d",
      });
      return;
    }

    loadLayout();
  }, [selectedDate, fromTime, toTime, selectedArea, filtersLoaded, bookingsLoaded]);

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
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, [selectedDate, fromTime, toTime, selectedArea]);
 
  /* ================= API LOGIC ================= */

  // Load Layout
  const loadLayout = async () => {
    try {
      const layoutData = await fetchLayout(
        selectedArea,
        selectedDate,
        fromTime,
        toTime
      );
      const updatedSlots = initialSlots.map((layoutSlot) => {
        const backendSlot = layoutData?.data?.slots?.find(
          (s: any) => String(s.slot_id) === String(layoutSlot.id)
        );

        let state: "available" | "fixed" | "reserved" | "parked" = layoutSlot.status;

        const myBooking = myBookings.find((b: any) => {
        if (
          String(b.slot_id) !== String(layoutSlot.id) ||
          (b.status !== "BOOKED" && b.status !== "PARKED")
        ) return false;

        const bookingStart = new Date(b.booking_start);
        const bookingEnd = new Date(b.booking_end);

        const selectedStart = new Date(
          `${selectedDate}T${convertTo24Hour(fromTime)}:00`
        );

        const selectedEnd = new Date(
          `${selectedDate}T${convertTo24Hour(toTime)}:00`
        );
        let start = selectedStart;
        let end = selectedEnd;

        if (start > end) {
          const temp = start;
          start = end;
          end = temp;
        }

          return bookingStart < end && bookingEnd > start;
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

          const bookingDate = new Date(booking.booking_start)
            .toISOString()
            .split("T")[0];

          const from = formatTime(booking.booking_start);
          const to = formatTime(booking.booking_end);

          setSelectedDate(bookingDate);
          setFromTime(from);
          setToTime(to);

          localStorage.setItem("selectedDate", bookingDate);
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
        alert("Cancel existing booking first");
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
      if (!selectedSlotId || !selectedDate || !fromTime || !toTime) {
        alert("Please complete all selections");
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
        await createBooking({
          slotId: selectedSlotId,
          date: selectedDate,
          fromTime,
          toTime,
          plateNumber: "TN09AB1234"
        });

        Swal.fire(t("success"), t("slotBooked"), "success");

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

        // ✅ CLEAR FILTERS
        localStorage.removeItem("selectedDate");
        localStorage.removeItem("fromTime");
        localStorage.removeItem("toTime");

        // ✅ CLEAR FILTERS
        setSelectedDate("");
        setFromTime("");
        setToTime("");

        localStorage.removeItem("selectedDate");
        localStorage.removeItem("fromTime");
        localStorage.removeItem("toTime");

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
    {/* PAGE TITLE */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        marginBottom: 3
      }}
    >
    {/* Left empty space */}
    <div></div>

    {/* Center Title */}
    <h1
      style={{
        margin: 0,
        fontSize: 20,
        fontWeight: 600,
        color: "#222",
        letterSpacing: 0.5,
        textAlign: "center",
        marginTop: 5,
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif"
      }}
    >
      {t("app_name")}
    </h1>
    {/* Right User Icon */}
    <div  style={{ 
    display: "flex", 
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "10px"
  }}>
      <div className="language-switch-header">
        <button onClick={toggleLanguage}>
          {i18n.language === "en" ? "日本語" : "EN"}
        </button>
      </div>
      <UserMenu />
    </div>
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
            fontSize: 9
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
              padding: "2px 6px",
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
          {new Date(booking.booking_start).toLocaleDateString()} <br />
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
            date={selectedDate}
            fromTime={convertTo24Hour(fromTime)}
            toTime={convertTo24Hour(toTime)}
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
        {new Date(booking.booking_start).toLocaleDateString()} <br />
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
    padding: "20px",
    paddingBottom: "50px",   // 👈 IMPORTANT
    margin: "20px auto 30px auto",  // 👈 gives breathing space
    maxWidth: "1400px"
  }}
  >
  <ParkingCanvas
    slots={slots}
    onSlotClick={handleSlotClick}
    isMobile={isMobile} 
  />
  </div>
</div>
</div>
);
}