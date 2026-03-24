import { useState, useEffect } from "react";
import { initialSlots } from "../data/parkingLayout";
<<<<<<< HEAD
=======
import UserMenu from "./UserMenu";
import Swal from "sweetalert2";
>>>>>>> 701457f (updated)
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

<<<<<<< HEAD
    console.log("BACKEND SLOTS:", data.slots);
console.log("INITIAL SLOTS:", initialSlots); // 👈 ADD THIS

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
=======
   
    // If filters are empty but user has booking
    

    const layoutData = await fetchLayout(selectedArea, date, startTime, endTime);
    console.log("API response:", layoutData?.data?.slots);
    console.log("Layout API response:", layoutData);

    const updatedSlots = initialSlots.map((layoutSlot) => {

  const backendSlot = layoutData?.data?.slots?.find(
  (s: any) => String(s.slot_id) === String(layoutSlot.id)
);

let state = layoutSlot.status;

// 🔥 YOUR BOOKINGS
const myBooking = myBookings.find(
  (b: any) =>
    String(b.slot_id) === String(layoutSlot.id) &&
    (b.status === "BOOKED" || b.status === "PARKED")
);

if (myBooking) {
  state = myBooking.status === "BOOKED" ? "reserved" : "parked";
}

// 🔥 BACKEND (STRICT MATCH ONLY)
else if (backendSlot) {
  if (backendSlot.status === "reserved" || backendSlot.status === "BOOKED") {
    state = "reserved";
  } else if (backendSlot.status === "parked" || backendSlot.status === "PARKED") {
    state = "parked";
  }
}

return {
  ...layoutSlot,
  state
};

});
console.log(
  updatedSlots.find((s) => s.id === "21-C1")
);
>>>>>>> 701457f (updated)

    setSlots(updatedSlots);

  } catch (error) {
    console.error("Layout fetch failed", error);
  }
};

const loadBookings = async () => {
  try {
<<<<<<< HEAD
    const data = await fetchBookings();
    setBookings(data.bookings);
=======

    const data = await fetchMyBookings();
    setMyBookings(
  data.bookings.filter(
    (b: any) => b.status === "BOOKED" || b.status === "PARKED"
  )
);

    if (data.bookings.length === 0) {

      localStorage.removeItem("selectedDate");
      localStorage.removeItem("fromTime");
      localStorage.removeItem("toTime");

    }

  } catch (error) {
    console.error("Booking check failed", error);
  }
};
const loadMyBookings = async () => {
  try {
    const data = await fetchMyBookings();
    setMyBookings(
  data.bookings.filter(
    (b: any) => b.status === "BOOKED" || b.status === "PARKED"
  )
);
>>>>>>> 701457f (updated)
  } catch (error) {
    console.error("Booking fetch failed", error);
  }
};

  const availableCount = slots.filter(
<<<<<<< HEAD
    (slot) => slot.status === "available"
=======
    (slot) => slot.state === "available" || slot.state === "selected"
>>>>>>> 701457f (updated)
  ).length;

  const parkedCount = slots.filter(
  (slot) => slot.status === "parked"
).length;

  const handleSlotClick = (id: string) => {
<<<<<<< HEAD
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === id && slot.status === "available"
          ? { ...slot, status: "selected" }
          : slot
      )
    );
    setSelectedSlotId(id);
  };
=======

  // 🚫 Block if user already has booking
  const hasActiveBooking = myBookings.some(
    b => b.status === "BOOKED" || b.status === "PARKED"
  );

  if (hasActiveBooking) {
    alert("You already have a booked slot. Cancel it before selecting another.");
    return;
  }

  // 🔥 Get clicked slot
  const clickedSlot = slots.find(s => s.id === id);
  if (!clickedSlot) return;

  // 🚫 BLOCK non-available slots
  if (
    clickedSlot.state === "reserved" ||
    clickedSlot.state === "parked" ||
    clickedSlot.state === "fixed"
  ) {
    alert("This slot is not available");
    return;
  }

  // ✅ Selection logic
  setSlots((prev) =>
    prev.map((slot) => {

      // Toggle same slot
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
>>>>>>> 701457f (updated)

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

  const result = await Swal.fire({
    title: "Confirm Booking?",
    text: `Slot ${selectedSlotId}\n${selectedDate} (${fromTime} - ${toTime})`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#095e6d",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Book it!"
  });

  if (!result.isConfirmed) return;

  try {
    await createBooking({
      slotId: selectedSlotId,
      date: selectedDate,
      fromTime,
      toTime,
      plateNumber: "TN09AB1234"
    });

<<<<<<< HEAD
    setSelectedSlotId(null);
    await loadLayout();
    await loadBookings();
=======
Swal.fire("Success!", "Slot booked successfully", "success");

// clear filters after booking
setSelectedDate("");
setFromTime("");
setToTime("");

localStorage.removeItem("selectedDate");
localStorage.removeItem("fromTime");
localStorage.removeItem("toTime");

setSelectedSlotId(null);
setSlots(prev =>
  prev.map(slot =>
    slot.id === selectedSlotId
      ? { ...slot, state: "reserved" }
      : slot
  )
);

// ✅ 2. Then sync backend
await loadMyBookings();
await loadLayout();   // keep it AFTER UI update
>>>>>>> 701457f (updated)

  } catch (error: any) {
    alert(error.message);
  }
};

  const handleCancel = async (bookingId: string) => {

    const result = await Swal.fire({
    title: "Cancel Booking?",
    text: "Are you sure you want to cancel this slot?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, Cancel it!"
  });

  if (!result.isConfirmed) return;

  try {
    await cancelBookingAPI(bookingId);
<<<<<<< HEAD
    await loadLayout();
    await loadBookings();
=======
     Swal.fire("Cancelled!", "Your booking has been cancelled", "success");
    await loadMyBookings();
    await loadLayout();
>>>>>>> 701457f (updated)
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
    <div style={{ textAlign: "center", marginBottom: 10 }}>
      <h1
        style={{
          margin: "0 0 5px 0",
      fontSize: 28,
      fontWeight: 600,
      color: "#222",
      letterSpacing: 0.5,
      marginTop: 1,
        }}
      >
        EliteSpot
      </h1>
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
<<<<<<< HEAD
  bookings.map((booking) => (
=======
  myBookings
  .filter(b => b.status !== "COMPLETED")
  .map((booking) => (
>>>>>>> 701457f (updated)
    <div
      key={booking.id}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6
      }}
    >
<<<<<<< HEAD
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
=======
      <div>
  <div style={{ fontSize: 14 }}>{booking.slot_id}</div>

  <div style={{ fontSize: 12, color: "#666" }}>
  {new Date(booking.booking_start).toLocaleDateString()} <br />
  {formatTime(booking.booking_start)} - {formatTime(booking.booking_end)}
</div>
</div>
      {(booking.status === "BOOKED" ) && (
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
)}
>>>>>>> 701457f (updated)
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
      background: "#dfdbdb94",            // grey background
      padding: "15x",
      borderRadius: 10,
      boxShadow: "inset 0 2px 6px rgba(0,0,0,0.05)"
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
