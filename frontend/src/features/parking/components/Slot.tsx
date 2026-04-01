// Import type for slot structure
import type { SlotType } from "../types/parking.types";

// Car icon for parked slots
import { FaCar } from "react-icons/fa";

// Props definition for the component
type Props = {
  slot: SlotType;     // Slot data (position, state, etc.)
  onClick: () => void; // Click handler for slot selection
};

// Slot component
export default function Slot({ slot, onClick }: Props) {

  /**
   * Returns background color based on slot state
   */
  const getColor = (): string => {
    const normalizedState = slot.state?.toLowerCase();

    switch (normalizedState) {
      case "available":
        return "#e5e7eb"; // Light gray

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
      // Handle click only if slot is available
      onClick={slot.state === "available" ? onClick : undefined}
      
      // Dynamic positioning and styling
      style={{
        position: "absolute",
        left: slot.position.x,
        top: slot.position.y,
        width: slot.position.width,
        height: slot.position.height,
        background: getColor(),
        border: "1px solid #9e9999",
        cursor: slot.state === "available" ? "pointer" : "not-allowed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {/* Show car icon only when slot is parked */}
      {slot.state === "parked" && (
        <FaCar size={16} color="#499980" />
      )}
    </div>
  );
}