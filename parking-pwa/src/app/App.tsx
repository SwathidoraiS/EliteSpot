import ParkingLayout from "../features/parking/components/ParkingLayout";
import { ParkingProvider } from "../features/parking/context/ParkingContext";

export default function App() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
        background: "#eef3f6"
      }}
    >
      <ParkingLayout />
    </div>
  );
}

