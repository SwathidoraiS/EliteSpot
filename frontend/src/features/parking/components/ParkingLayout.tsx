import { useState, useEffect } from "react";
import { initialSlots } from "../data/parkingLayout";
import UserMenu from "./UserMenu";
import {
  fetchLayout,
  createBooking,
  cancelBooking as cancelBookingAPI,
  fetchBookings,
  fetchMyBookings
} from "../../../services/parkingService";
import FilterBar from "./FilterBar";
import Dashboard from "./Dashboard";
import Legend from "./Legend";
import ParkingCanvas from "./ParkingCanvas";

export default function ParkingLayout() {
  const [slots, setSlots] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]); 
  const [selectedArea, setSelectedArea] = useState("1"); 
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
  checkUserBooking();
}, []);

const [isMobile, setIsMobile] = useState(false);
useEffect(() => {

  const savedDate = localStorage.getItem("selectedDate");
  const savedFrom = localStorage.getItem("fromTime");
  const savedTo = localStorage.getItem("toTime");

  if (savedDate) setSelectedDate(savedDate);
  if (savedFrom) setFromTime(savedFrom);
  if (savedTo) setToTime(savedTo);

}, []);

useEffect(() => {
  const checkScreen = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  checkScreen();
  window.addEventListener("resize", checkScreen);

  return () => window.removeEventListener("resize", checkScreen);
}, []);

useEffect(() => {

  if (!selectedDate || !fromTime) return;

  loadLayout();

}, [selectedDate, fromTime, toTime, selectedArea]);

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
const formatTime = (dateTime: string) => {
  if (!dateTime) return "";

  // Example SQL value: 2026-03-11T04:00:00.000Z or 2026-03-11 04:00:00
  const timePart = dateTime.split("T")[1] || dateTime.split(" ")[1];

  let [hours, minutes] = timePart.split(":");

  hours = parseInt(hours);

  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${hours}:${minutes} ${ampm}`;
};
const loadLayout = async () => {
  
  try {
    
    const startTime = convertTo24Hour(fromTime);
    const endTime = convertTo24Hour(toTime);

    const layoutData = await fetchLayout(selectedArea, selectedDate, startTime, endTime);
    console.log("API response:", layoutData?.data?.slots);

    const updatedSlots = initialSlots.map((layoutSlot) => {

  const backendSlot = layoutData?.data?.slots?.find(
    (s: any) => s.slot_id === layoutSlot.id
  );

  return {
    ...layoutSlot,
    state: backendSlot ? backendSlot.status : layoutSlot.status
  };

});
console.log(
  updatedSlots.find((s) => s.id === "21-C1")
);

    setSlots(updatedSlots);

  } catch (error) {
    console.error("Layout fetch failed", error);
  }
};
const checkUserBooking = async () => {

  try {

    const data = await fetchMyBookings();
    setMyBookings(data.bookings);

    if (data.bookings.length > 0) {

      const booking = data.bookings[0];

      const start = new Date(booking.booking_start);
      const end = new Date(booking.booking_end);

      const date = start.toISOString().split("T")[0];

      const format = (d: Date) =>
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const from = format(start);
      const to = format(end);

      setSelectedDate(date);
      setFromTime(from);
      setToTime(to);

      localStorage.setItem("selectedDate", date);
      localStorage.setItem("fromTime", from);
      localStorage.setItem("toTime", to);

    } else {

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
    setMyBookings(data.bookings);
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
  if (myBookings.length > 0) {
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
    await loadMyBookings();

  } catch (error: any) {
    alert(error.message);
  }
};

  const handleCancel = async (bookingId: string) => {
  try {
    await cancelBookingAPI(bookingId);
    await loadLayout();
    await loadMyBookings();
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
      selectedArea={selectedArea}
      setSelectedArea={setSelectedArea}
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
            padding: "10px 20px",
            borderRadius: 14,
            boxShadow:
              " 0 8px 24px rgba(0,0,0,0.12)",
            width: isMobile ? "50%" :220,
            transition: "all 0.2s ease",
          }}
    >
      <h4 style={{ fontSize: 12,margin: "0 0 6px 0" }}>Your Bookings</h4>

      {myBookings.length === 0 ? (
  <p style={{ fontSize: 12, color: "#777", margin: 0 }}>
    No active bookings
  </p>
) : (
  myBookings.map((booking) => (
    <div
      key={booking.booking_id}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6
      }}
    >
      <div>
  <div style={{ fontSize: 14 }}>{booking.slot_id}</div>

  <div style={{ fontSize: 12, color: "#666" }}>
    {formatTime(booking.booking_start)} - {formatTime(booking.booking_end)}
  </div>
</div>
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
