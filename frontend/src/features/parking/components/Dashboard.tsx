type Props = {
  availableCount: number;
  parkedCount: number;
  isMobile: boolean;
};

export default function Dashboard({
  availableCount,
  parkedCount,
  isMobile,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 15,
        width: "100%",
        flexDirection: isMobile ? "row" : "row",
      }}
    >
      <div style={{ display: "flex", gap: "15px" }}>
        <div
          style={{
            background: "linear-gradient(145deg, #ffffff, #f3f6f9)",
            padding: "10px 20px",
            borderRadius: 14,
            boxShadow:
              " 0 8px 24px rgba(0,0,0,0.12)",
            width: isMobile ? "50%" : 170,
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
            padding: "10px 20px",
            borderRadius: 14,
            boxShadow:
              " 0 8px 24px rgba(0,0,0,0.12)",
           width: isMobile ? "50%" : 170,
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
