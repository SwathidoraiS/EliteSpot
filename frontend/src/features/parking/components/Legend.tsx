import { useTranslation } from "react-i18next";

/**
 * 🧭 Legend Component
 * Displays meaning of slot colors (Available / Reserved / Fixed)
 */
export default function Legend() {

  const { t } = useTranslation();

  // 📌 Legend items (easy to extend later)
  const legendItems = [
    {
      label: t("available"),
      color: "#ffffff",
      border: "1px solid #999",
    },
    {
      label: t("reserved"),
      color: "#28a745",
    },
    {
      label: t("fixed"),
      color: "#ee332d8d",
    },
  ];

  return (
    <div style={containerStyle}>
      <div style={legendWrapper}>
        {legendItems.map((item) => (
          <div key={item.label} style={legendItemStyle}>
            
            {/* 🎨 Color Box */}
            <div
              style={{
                ...colorBox,
                background: item.color,
                border: item.border || "none",
              }}
            />

            {/* 🏷 Label */}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 🎨 STYLES */

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  marginTop: "4px",
};

const legendWrapper = {
  display: "flex",
  gap: "15px",
};

const legendItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const colorBox = {
  width: 16,
  height: 16,
};