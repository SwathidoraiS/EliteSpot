type Props = {
  availableCount: number;
  reservedCount: number;
  selectedSlotId: string | null;
  onConfirm: () => void;
};

export default function Dashboard({
  availableCount,
  reservedCount,
  selectedSlotId,
  onConfirm
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 1
      }}
    >
      <div style={{ display: "flex", gap: "15px" }}>
        <div
          style={{
            background: "#fff",
            padding: "12px 16px",
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            minWidth: 140
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
            Available Slots
          </p>
          <h3 style={{ margin: "4px 0 0 0", fontSize: 20 }}>
            {availableCount}/21
          </h3>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "12px 16px",
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            minWidth: 140
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
            Parked Slots
          </p>
          <h3 style={{ margin: "4px 0 0 0", fontSize: 20 }}>
            {reservedCount}/21
          </h3>
        </div>
      </div>

      <button
        onClick={onConfirm}
        disabled={!selectedSlotId}
        style={{
          background: selectedSlotId ? "#095e6d" : "#ccc",
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          borderRadius: 6,
          cursor: selectedSlotId ? "pointer" : "not-allowed"
        }}
      >
        Confirm
      </button>
    </div>
  );
}
