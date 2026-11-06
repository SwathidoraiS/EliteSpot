import Slot from "./Slot";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BsArrow90DegRight } from "react-icons/bs";
import type { SlotType, Booking } from "../types/parking.types";
type Props = {
  slots: SlotType[];
  onSlotClick: (id: string) => void;
  isMobile: boolean;
  myBookings: Booking[];
  selectedSlotId: string | null;
  selectedArea: string;
};

/**
 *  ParkingCanvas
 * Renders parking slots layout with scaling support for mobile/desktop
 */
export default function ParkingCanvas({ slots, onSlotClick, isMobile, myBookings, selectedSlotId, selectedArea }: Props) {
   const {t} = useTranslation();
  
  // 📏 Responsive scaling
  const scaleValue = isMobile ? 0.45 : 0.69;
  
  const [zoom, setZoom] = useState(1);
  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  // 📐 Canvas dimensions
const canvasWidth = isMobile ? 400 : 950;
const canvasHeight = isMobile ? 280 : 380;

const wrapperHeight = isMobile
  ? canvasHeight * scaleValue * zoom + 20
  : canvasHeight * scaleValue * zoom + 30;

   return (
    <div>

      {/* 🔥 ZOOM BUTTONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          
        }}
      >
        <button onClick={zoomOut} style={zoomBtn}>-</button>
        <button onClick={zoomIn} style={zoomBtn}>+</button>
      </div>

      {/* Canvas Wrapper */}
      <div
        style={{
          display: "flex",
          justifyContent: isMobile ? "flex-start" : "center",
          height: wrapperHeight,
          overflow: "auto",
        
        }}
      >
      <div
        style={{
          position: "relative",
          width: canvasWidth,
          height: canvasHeight,
          
          transform: `scale(${scaleValue * zoom})`,
          transformOrigin: isMobile ? "top left" : "top center",
        }}
      >
  {/* 🔼 Driving Direction Arrows */}
{selectedArea === "2" && (
  <>
  <div
    style={{
      position: "absolute",
      left: -10,
      top: 230,
      fontSize: "50px",
      color: "#b1b0b0c7",
      fontWeight: "bold",
    userSelect: "none",
    }}
  >↑ </div>
<div
  style={{
    position: "absolute",
    left: 10,
    top: 1,
    userSelect: "none",
  }}
>
  <BsArrow90DegRight
    size={34}
    color="#b1b0b0c7"   // darker
    style={{ strokeWidth: 1.5 }}
  />
</div>
  

  <div
    style={{
      position: "absolute",
      left: 410,
      top: 130,
      fontSize: "50px",
      color: "#b1b0b0c7",
      fontWeight: "bold",
    userSelect: "none",
    }}
  > ↓</div>
 

  {/* LEFT */}
<div
  style={{
    position: "absolute",
    left: 230,
    top: 292,
    fontSize: "16px",
    fontWeight: "300",
    color: "#a6a2a2",
    userSelect: "none",
  }}
>
  {t("left")}
</div>

{/* CENTER */}
<div
  style={{
    position: "absolute",
    left: 475,
    top: 292,
    fontSize: "16px",
    fontWeight: "300",
    color: "#a6a2a2",
    userSelect: "none",
    whiteSpace: "nowrap",
  }}
>
  {t("center")}
</div>

{/* RIGHT */}
<div
  style={{
    position: "absolute",
    left: 755,
    top: 292,
    fontSize: "16px",
    fontWeight: "300",
    color: "#a6a2a2",
    userSelect: "none",
  }}
>
  {t("right")}
</div>
</>
)}
          {slots.map((slot) => {
            const booking = myBookings.find(
              (b) => b.slot_id === slot.id
            );
             
            return (
              
              <Slot
                key={slot.id}
                slot={{ ...slot, booking }} // 👈 attach booking
                onClick={() => onSlotClick(slot.id)}
                selectedSlotId={selectedSlotId}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 🔥 Button style
const zoomBtn = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
  fontSize: 18
};
