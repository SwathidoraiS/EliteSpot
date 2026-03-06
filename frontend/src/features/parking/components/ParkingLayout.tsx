import { useState, useEffect } from "react";
import { initialSlots } from "../data/parkingLayout";
import UserMenu from "./UserMenu";
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

export default function ParkingLayout() {
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
  loadLayout();
  loadBookings();
}, []);

const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkScreen = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  checkScreen();
  window.addEventListener("resize", checkScreen);

  return () => window.removeEventListener("resize", checkScreen);
}, []);


const loadLayout = async () => {
  try {
    const layoutData = await fetchLayout("1");
    const updatedSlots = initialSlots.map(layoutSlot => {
      const backendSlot = layoutData.slots.find(
        (s: any) => s.slot_id === layoutSlot.id
      );

      const isBooked = bookings.some(
        (b: any) => b.slot_id === layoutSlot.id
      );

      let state = backendSlot?.state ?? layoutSlot.status;

      if (isBooked) {
        state = "reserved";   // 👈 THIS MAKES IT GREEN
      }

      return {
        ...layoutSlot,
        state
      };
    });

    setSlots(updatedSlots);

  } catch (error) {
    console.error("Layout fetch failed", error);
  }
};

const loadBookings = async () => {
  try {
    const data = await fetchMyBookings();
    setBookings(data.bookings);
  } catch (error) {
    console.error("Booking fetch failed", error);
  }
};

  const availableCount = slots.filter(
    (slot) => slot.state === "available" || slot.state ==="selected"
  ).length;

  const parkedCount = slots.filter(
  (slot) => slot.state === "parked"
).length;

  const handleSlotClick = (id: string) => {

  // 🚫 If user already has a booking, don't allow selection
  if (bookings.length > 0) {
    alert("You already have a booked slot. Cancel it before selecting another.");
    return;
  }

  setSlots((prev) =>
    prev.map((slot) => {

      // If clicking same slot again → deselect
      if (slot.id === id) {
        if (slot.state === "selected") {
          return { ...slot, state: "available" };
        }

        if (slot.state === "available") {
          return { ...slot, state: "selected" };
        }
      }

      // Reset previous selected slot
      if (slot.state === "selected") {
        return { ...slot, state: "available" };
      }

      return slot;
    })
  );

  setSelectedSlotId((prev) => (prev === id ? null : id));
};

  const handleConfirm = async () => {

  if (!selectedSlotId) {
    alert("Please select a slot first");
    return;
  }

  if (!selectedDate) {
    alert("Please select a date first");
    return;
  }

  if (!fromTime || !toTime) {
    alert("Please select start and end time");
    return;
  }

  try {
    await createBooking({
      slotId: selectedSlotId,
      date: selectedDate,
      fromTime,
      toTime,
      plateNumber: "TN09AB1234"
    });

    setSelectedSlotId(null);
    await loadLayout();
    await loadBookings();

  } catch (error: any) {
    alert(error.message);
  }
};

  const handleCancel = async (bookingId: string) => {
  try {
    await cancelBookingAPI(bookingId);
    await loadLayout();
    await loadBookings();
  } catch (error) {
    alert("Cancel failed");
  }
};

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
      fontSize: 28,
      fontWeight: 600,
      color: "#222",
      letterSpacing: 0.5,
      textAlign: "center",
      marginTop: 5
    }}
  >
    EliteSpot
  </h1>

  {/* Right User Icon */}
  <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
      isMobile={isMobile}
    />
    
<div
  style={{
    display: "flex",
flexDirection: isMobile ? "column" : "row",
alignItems: isMobile ? "stretch" : "center",
gap: isMobile ? 20 : 0,
justifyContent: "space-between",
    marginBottom: 20
  }}
>
  {/* LEFT SIDE GROUP */}
  <div style={{ display: "flex", alignItems: "center", gap: 25 }}>

    {/* Available + Parked */}
    <div style={{ display: "flex", gap: 15 }}>
      <Dashboard
        availableCount={availableCount}
        parkedCount={parkedCount}
        isMobile={isMobile}
      />
    </div>

    {/* Your Bookings */}
    <div
      style={{
            background: "linear-gradient(145deg, #ffffff, #f3f6f9)",
            padding: "16px 20px",
            borderRadius: 14,
            boxShadow:
              " 0 8px 24px rgba(0,0,0,0.12)",
            width: isMobile ? "50%" : 170,
            transition: "all 0.2s ease",
          }}
    >
      <h4 style={{ fontSize: 12,margin: "0 0 6px 0" }}>Your Bookings</h4>

      {bookings.length === 0 ? (
  <p style={{ fontSize: 12, color: "#777", margin: 0 }}>
    No active bookings
  </p>
) : (
  bookings.map((booking) => (
    <div
      key={booking.booking_id}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6
      }}
    >
      <span style={{ fontSize: 14 }}>{booking.slot_id}</span>
      <button
        onClick={() => handleCancel(booking.booking_id)}
        style={{
          background: "#ee332d8d",
          border: "none",
          color: "#fff",
          padding: "3px 8px",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 12
        }}
      >
        Cancel
      </button>
    </div>
  ))
)}
    </div>
  </div>

  {/* CONFIRM BUTTON — RIGHTMOST */}
  <button
    onClick={handleConfirm}
    
    disabled={!selectedSlotId}
    style={{
  background: selectedSlotId
    ? "linear-gradient(135deg, #095e6d, #0b7f8e)"
    : "#cfd8dc",
  color: "#fff",
  padding: "12px 28px",
  border: "none",
  borderRadius: 12,
  cursor: selectedSlotId ? "pointer" : "not-allowed",
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: 0.5,
  boxShadow: selectedSlotId
    ? " 0 8px 24px rgba(0,0,0,0.12)"
    : "none",
  transition: "all 0.2s ease"
}}
  >
    Confirm
  </button>
</div>

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
