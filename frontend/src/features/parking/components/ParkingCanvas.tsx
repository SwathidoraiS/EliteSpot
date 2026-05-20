import Slot from "./Slot";
import type { SlotType } from "../types/parking.types";
import { useState } from "react";

type Props = {
  slots: SlotType[];
  onSlotClick: (id: string) => void;
  isMobile: boolean;
  myBookings: any[];
};

/**
 *  ParkingCanvas
 * Renders parking slots layout with scaling support for mobile/desktop
 */
export default function ParkingCanvas({ slots, onSlotClick, isMobile, myBookings }: Props) {

  
  // 📏 Responsive scaling
  const scaleValue = isMobile ? 0.32 : 0.69;

  const [zoom, setZoom] = useState(1);
  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  // 📐 Canvas dimensions
  const canvasWidth = 950;
  const canvasHeight = isMobile ? 350 : 240;

  

   return (
    <div>

      {/* 🔥 ZOOM BUTTONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          marginBottom: 10
        }}
      >
        <button onClick={zoomOut} style={zoomBtn}>-</button>
        <button onClick={zoomIn} style={zoomBtn}>+</button>
      </div>

      {/* Canvas Wrapper */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: isMobile ? canvasHeight * scaleValue : 250,
          overflow: "auto", 

        }}
      >
        
        <div
          style={{
            position: "relative",
            width: canvasWidth,
            height: canvasHeight,
            flexShrink: 0,
            transform: `scale(${scaleValue * zoom})`, // 🔥 COMBINED SCALE
            transformOrigin: "top center",
            transition: "transform 0.2s ease"
          }}
        >
          {slots.map((slot) => {
            const booking = myBookings.find(
              (b) => b.slot_id === slot.id
            );
             console.log("MERGED SLOT:", { ...slot, booking });
            return (
              
              <Slot
                key={slot.id}
                slot={{ ...slot, booking }} // 👈 attach booking
                onClick={() => onSlotClick(slot.id)}
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
