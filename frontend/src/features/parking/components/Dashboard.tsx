import { useTranslation } from "react-i18next";


// Props type
type Props = {
  isMobile: boolean;
  availableCount: number;
  parkedCount: number;
};

export default function Dashboard({ isMobile, availableCount, parkedCount }: Props) {

  const { t } = useTranslation();

  return (
    <div
      style={{
        display: "flex",
        gap: 15,
        width: "100%",
        flexDirection: "row",
      }}
    >
      <div style={{ display: "flex", gap: "15px" }}>

        {/* Available */}
        <div
          style={{
            background: "linear-gradient(145deg, #ffffff, #f3f6f9)",
            padding: "10px 20px",
            borderRadius: 14,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            width: isMobile ? "50%" : 170,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
            {t("available_slots")}
          </p>
          <h3 style={{ margin: "4px 0 0 0", fontSize: 20 }}>
            {availableCount}
          </h3>
        </div>

        {/* Parked */}
        <div
          style={{
            background: "linear-gradient(145deg, #ffffff, #f3f6f9)",
            padding: "10px 20px",
            borderRadius: 14,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            width: isMobile ? "50%" : 170,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
            {t("parked_slots")}
          </p>
          <h3 style={{ margin: "4px 0 0 0", fontSize: 20 }}>
            {parkedCount}
          </h3>
        </div>
      </div>
    </div>
  );
}