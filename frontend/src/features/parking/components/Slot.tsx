type Props = {
  slot: SlotType;
  onClick: () => void;
};

export default function Slot({ slot, onClick }: Props) {
  const getColor = () => {
    switch (slot.state) {
      case "available":
        return "#ffffff";
      case "selected":
        return "#f4c430"; // yellow
      case "reserved":
        return "#2ecc71"; // green
      case "disabled":
        return "#ee332d8d"; // red
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