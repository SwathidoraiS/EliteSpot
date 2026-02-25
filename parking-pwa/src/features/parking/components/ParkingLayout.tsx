import { useState } from "react";
import { initialSlots } from "../data/parkingLayout";
import FilterBar from "./FilterBar";
import Dashboard from "./Dashboard";
import Legend from "./Legend";
import ParkingCanvas from "./ParkingCanvas";
import type { Slot as SlotType } from "../types/parking.types";


export default function ParkingLayout() {
  const [slots, setSlots] = useState(initialSlots);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [fromTime, setFromTime] = useState("10:00");
  const [toTime, setToTime] = useState("13:10");

  const availableCount = slots.filter(
    (slot) => slot.state === "available"
  ).length;

  const reservedCount = slots.filter(
    (slot) => slot.state === "reserved"
  ).length;

  const handleSlotClick = (id: string) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === id && slot.state === "available"
          ? { ...slot, state: "selected" }
          : slot
      )
    );
    setSelectedSlotId(id);
  };

  const handleConfirm = () => {
    if (!selectedSlotId) return;

    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === selectedSlotId
          ? { ...slot, state: "reserved" }
          : slot
      )
    );

    setSelectedSlotId(null);
  };

  return (
  <div
    style={{
      width: "100%",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f7fafc, #fcfcfc)",
      padding: "30px 40px",
      boxSizing: "border-box",
      fontFamily: "Inter, sans-serif",
      marginBottom: 1
    }}
  >
    {/* PAGE TITLE */}
    <div style={{ textAlign: "center", marginBottom: 20 }}>
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
      fromTime={fromTime}
      toTime={toTime}
      setFromTime={setFromTime}
      setToTime={setToTime}
    />

    <Dashboard
      availableCount={availableCount}
      reservedCount={reservedCount}
      selectedSlotId={selectedSlotId}
      onConfirm={handleConfirm}
    />

    <Legend />

    <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
      <ParkingCanvas
        slots={slots}
        onSlotClick={handleSlotClick}
      />
    </div>
    
  </div>
);

}
