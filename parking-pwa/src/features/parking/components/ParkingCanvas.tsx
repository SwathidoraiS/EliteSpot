import Slot from "./Slot";
import type { Slot as SlotType } from "../types/parking.types";

type Props = {
  slots: SlotType[];
  onSlotClick: (id: string) => void;
};

export default function ParkingCanvas({ slots, onSlotClick }: Props) {
  return (
    <div style={{ position: "relative", width: 950, height: 410 }}>
      {slots.map((slot) => (
        <Slot
          key={slot.id}
          slot={slot}
          onClick={() => onSlotClick(slot.id)}
        />
      ))}
    </div>
  );
}
