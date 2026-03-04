import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ParkingLayout from "../features/parking/components/ParkingLayout";
import { ParkingProvider } from "../features/parking/context/ParkingContext";
import AdminPage from "../features/parking/components/AdminPage"; // create this file

export default function App() {
  return (
    <Router>
      <ParkingProvider>
          <Routes>
            {/* Main Parking Page */}
            <Route path="/" element={<ParkingLayout />} />

            {/* Admin Page */}
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        
      </ParkingProvider>
    </Router>
  );
}