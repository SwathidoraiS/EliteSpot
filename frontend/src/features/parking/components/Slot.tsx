// Import type for slot structure
import type { SlotType } from "../types/parking.types";
import { useState } from "react";
// Car icon for parked slots
import { FaCar } from "react-icons/fa";

// Props definition for the component
type Props = {
  slot: SlotType;     // Slot data (position, state, etc.)
  onClick: () => void; // Click handler for slot selection
};

// Slot component
export default function Slot({ slot, onClick }: Props) {

  const [showTooltip, setShowTooltip] = useState(false);

  const formatTime = (iso?: string) => {
    return iso ? iso.substring(11, 16) : "N/A";
  };
  /**
   * Returns background color based on slot state
   */
  const getColor = (): string => {
    const normalizedState = slot.state?.toLowerCase();
    

    switch (normalizedState) {
      case "available":
        return "#e5e7eb6b"; // Light gray

      case "selected":
        return "#f4c430"; // Yellow

      case "reserved":
        return "#2ecc71"; // Green

      case "fixed":
        return "#da6767c1"; // Red-ish

      case "parked":
        return "#f6f4f3"; // Off white

      default:
        return "#ccc"; // Default fallback
    }
  };

  return (
  <div
    onMouseEnter={() => setShowTooltip(true)}
    onMouseLeave={() => setShowTooltip(false)}
    onClick={(e) => {
      e.stopPropagation();
      if (slot.state === "available") onClick();

      // Only toggle on mobile
      if (window.innerWidth < 768) {
        setShowTooltip((prev) => !prev);
      }
    }}
    style={{
      position: "absolute",
      left: slot.position.x,
      top: slot.position.y,
    }}
  >

    {/* SLOT BOX */}
    <div
      style={{
        width: slot.position.width,
        height: slot.position.height,
        background: getColor(),
        border: "1px solid #9e9999",
        cursor: slot.state === "available" ? "pointer" : "not-allowed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `rotate(${slot.position.rotate || 0}deg)`,
        transformOrigin: "center",
      }}
    >
      {slot.state === "parked" && (
        <FaCar size={16} color="#499980" />
      )}
    </div>

    {/* TOOLTIP (NOT ROTATED) */}
    {showTooltip && (
      <div
        style={{
          position: "absolute",
          top: -60,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#111",
          color: "#fff",
          padding: "6px 10px",
          borderRadius: 6,
          fontSize: 12,
          whiteSpace: "nowrap",
          zIndex: 999,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
        }}
      >
        <div><b>Slot:</b> {slot.id}</div>

        <div><b>Status:</b> {slot.state}</div>
        
          {slot.booking && (
            <>
             <div>
              <b>Time:</b>{" "}
              {formatTime(slot.booking.booking_start)} - {formatTime(slot.booking.booking_end)}
            </div>
            </>
          )}
      </div>
    )}

  </div>
);
}