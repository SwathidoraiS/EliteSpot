import Slot from "./Slot";
import type { SlotType } from "../types/parking.types";
type Props = {
  slots: SlotType[];
  onSlotClick: (id: string) => void;
  isMobile: boolean;
};

export default function ParkingCanvas({ slots, onSlotClick, isMobile }: Props) {

  const scaleValue = isMobile ? 0.35 : 0.9;
  const canvasWidth = isMobile ? 950 : 950;
  const canvasHeight = isMobile ? 330: 300;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        height: isMobile ? canvasHeight * scaleValue : "auto"  // ✅ FIX
      }}
    >
      <div
        style={{
          position: "relative",
          width: canvasWidth,
          height: canvasHeight,
          flexShrink: 0,
          transform: `scale(${scaleValue})`,
          transformOrigin: "top center"
        }}
      >
        {slots.map((slot) => (
          <Slot
            key={slot.id}
            slot={slot}
            onClick={() => onSlotClick(slot.id)}
          />
        ))}
      </div>
    </div>
  );
}