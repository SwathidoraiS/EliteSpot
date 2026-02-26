type Props = {
  availableCount: number;
  parkedCount: number;
};

export default function Dashboard({
  availableCount,
  parkedCount,
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
            background: "linear-gradient(145deg, #ffffff, #f3f6f9)",
            padding: "16px 20px",
            borderRadius: 14,
            boxShadow:
              "0 6px 18px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
            minWidth: 170,
            transition: "all 0.2s ease",
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
            Available Slots
          </p>
          <h3 style={{ margin: "4px 0 0 0", fontSize: 20 }}>
            {availableCount}
          </h3>
        </div>

        <div
          style={{
            background: "linear-gradient(145deg, #ffffff, #f3f6f9)",
            padding: "16px 20px",
            borderRadius: 14,
            boxShadow:
              "0 6px 18px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
            minWidth: 170,
            transition: "all 0.2s ease",
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
            Parked Slots
          </p>
          <h3 style={{ margin: "4px 0 0 0", fontSize: 20 }}>
            {parkedCount}
          </h3>
        </div>
      </div>

    </div>
  );
}
