import Slot from "./Slot";
import type { SlotType } from "../types/parking.types";
type Props = {
  slots: SlotType[];
  onSlotClick: (id: string) => void;
};

export default function ParkingCanvas({ slots, onSlotClick }: Props) {

  const maxY = Math.max(
    ...slots.map(slot => slot.position.y + slot.position.height)
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          position: "relative",
          width: 950,
          height: 300,   // 🔥 dynamic height
          transform: "scale(0.80)", // optional slight scale
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