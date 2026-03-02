import { useState, useEffect } from "react";
import { initialSlots } from "../data/parkingLayout";
import UserMenu from "./UserMenu";
import {
  fetchLayout,
  createBooking,
  cancelBooking as cancelBookingAPI,
  fetchBookings
} from "../../../services/parkingService";
import FilterBar from "./FilterBar";
import Dashboard from "./Dashboard";
import Legend from "./Legend";
import ParkingCanvas from "./ParkingCanvas";
import type { Slot as SlotType } from "../types/parking.types";


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

const loadLayout = async () => {
  try {
    const data = await fetchLayout("1");
    const updatedSlots = initialSlots.map(layoutSlot => {
      const backendSlot = data.slots.find(
        (s: any) => s.slot_id === layoutSlot.id
      );

      return {
        ...layoutSlot,
        status: backendSlot?.status ?? layoutSlot.status
      };
    });

    console.log("AFTER MERGE:", updatedSlots); // 👈 ADD THIS

    setSlots(updatedSlots);

  } catch (error) {
    console.error("Layout fetch failed", error);
  }
};

const loadBookings = async () => {
  try {
    const data = await fetchBookings();
    setBookings(data.bookings);
  } catch (error) {
    console.error("Booking fetch failed", error);
  }
};

  const availableCount = slots.filter(
    (slot) => slot.status === "available" || slot.status ==="selected"
  ).length;

  const parkedCount = slots.filter(
  (slot) => slot.status === "parked"
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
        if (slot.status === "selected") {
          return { ...slot, status: "available" };
        }

        if (slot.status === "available") {
          return { ...slot, status: "selected" };
        }
      }

      // Reset previous selected slot
      if (slot.status === "selected") {
        return { ...slot, status: "available" };
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
    height: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "20px 40px",
    boxSizing: "border-box",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
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
      textAlign: "center"
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
    />
    
<div
  style={{
    display: "flex",
    alignItems: "center",
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
      />
    </div>

    {/* Your Bookings */}
    <div
      style={{
        background: "linear-gradient(145deg, #ffffff, #f4f7fa)",
        padding: "16px 22px",
        borderRadius: 14,
        boxShadow:
          "0 6px 18px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
        minWidth: 230,
        transition: "all 0.2s ease"
      }}
    >
      <h4 style={{ margin: "0 0 8px 0" }}>Your Bookings</h4>

      {bookings.length === 0 ? (
  <p style={{ fontSize: 13, color: "#777", margin: 0 }}>
    No active bookings
  </p>
) : (
  bookings.map((booking) => (
    <div
      key={booking.id}
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
    
    fixed={!selectedSlotId}
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
    ? "0 8px 20px rgba(9,94,109,0.25)"
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
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    minHeight: 0
  }}
>
  <div
  style={{
    background: "#bdbebf2d",
    borderRadius: "20px",
    boxShadow: `
      0 8px 24px rgba(0,0,0,0.08),
      0 2px 6px rgba(0,0,0,0.04)
    `,
    padding: "40px",
    margin: "30px auto",
    maxWidth: "1400px"
  }}
>
    <ParkingCanvas
      slots={slots}
      onSlotClick={handleSlotClick}
    />
  </div>
</div>
    
  </div>
);

}
