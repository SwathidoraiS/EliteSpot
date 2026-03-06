import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ParkingLayout from "../features/parking/components/ParkingLayout";
import { ParkingProvider } from "../features/parking/context/ParkingContext";
import AdminPage from "../features/parking/components/AdminPage";
import LoginPage from "../features/parking/components/LoginPage";
import ProtectedRoute from "../features/parking/components/ProtectedRoute";
import ResetPassword from "../features/parking/components/ResetPassword";
import ForgotPassword from "../features/parking/components/ForgotPassword";
export default function App() {
  return (
    <Router>
      <ParkingProvider>
        <Routes>

          {/* Login Page */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Parking Page */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ParkingLayout />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Page */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route 
          path="/forgot-password" 
          element={
          <ForgotPassword />
          } />

          <Route 
          path="/reset-password/:token" 
          element={
          <ResetPassword />
          } />
        </Routes>
      </ParkingProvider>
    </Router>
  );
}