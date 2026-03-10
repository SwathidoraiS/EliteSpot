import type { SlotType } from "../types/parking.types";
type Props = {
  slot: SlotType;
  onClick: () => void;
};

export default function Slot({ slot, onClick }: Props) {

  const getColor = () => {
  const normalizedState = slot.state?.toLowerCase();

  switch (normalizedState) {
    case "available":
      return "#e5e7eb";

    case "selected":
      return "#f4c430";

    case "reserved":
      return "#2ecc71";

    case "fixed":
      return "#da6767c1";

    case "parked":
      return "#f59e0b";

    default:
      return "#ccc";
  }
};

  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        left: slot.position.x,
        top: slot.position.y,
        width: slot.position.width,
        height: slot.position.height,
        background: getColor(),
        border: "1px solid #9e9999",
        cursor: slot.state === "available" ? "pointer" : "not-allowed"
      }}
    />
  );
}