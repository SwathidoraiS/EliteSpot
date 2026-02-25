export default function Legend() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "5px"
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "15px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: 16,
              height: 16,
              background: "#ffffff",
              border: "1px solid #999"
            }}
          />
          <span>Available</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: 16,
              height: 16,
              background: "#28a745"
            }}
          />
          <span>Reserved</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: 16,
              height: 16,
              background: "#ee332d8d"
            }}
          />
          <span>Fixed</span>
        </div>
      </div>
    </div>
  );
}
