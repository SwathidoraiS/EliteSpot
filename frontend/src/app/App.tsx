// React Router imports for navigation
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Feature components
import ParkingLayout from "../features/parking/components/ParkingLayout";
import AdminPage from "../features/parking/components/AdminPage";
import LoginPage from "../features/parking/components/LoginPage";
import ResetPassword from "../features/parking/components/ResetPassword";
import ForgotPassword from "../features/parking/components/ForgotPassword";
import AdminReservations from "../features/parking/components/AdminReservations";
import Feedback from "../features/parking/components/Feedback";
import AdminFeedbackPage from "../features/parking/components/AdminFeedbackPage";
import BusinessTripApproval from "../features/parking/components/BusinessTripApproval"; 
import LayoutDesigner from "../features/parking/components/LayoutDesigner";
// Context Provider for global parking state
import { ParkingProvider } from "../features/parking/context/ParkingProvider";

// Route protection (checks authentication & role)
import ProtectedRoute from "../features/parking/components/ProtectedRoute";

/**
 * App Component
 * Root component that defines all application routes.
 * Wraps the app with Router and global ParkingProvider.
 */
export default function App() {
  return (
    <Router>
      {/* Global state provider for parking-related data */}
      <ParkingProvider>
        <Routes>

          {/* Public Route - Login Page */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Route - Main Parking Layout (User Dashboard) */}
          <Route path="/" element={<ProtectedRoute> <ParkingLayout /> </ProtectedRoute> }/>

          {/* Protected Route - Admin Page */}
          <Route path="/admin" element={<ProtectedRoute adminOnly> <AdminPage /> </ProtectedRoute>}/>

          {/*Protected Route - Admin Reservations Page */}
          <Route path="/admin-reservations" element={ <ProtectedRoute adminOnly> <AdminReservations /> </ProtectedRoute>} />
          
          {/*Public Route - Forgot Password */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/*Public Route - Reset Password (token-based) */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/*Public Route - Feedback */}
          <Route path="/feedback" element={ <ProtectedRoute> <Feedback /> </ProtectedRoute>} />
           
          {/*Protected Route - AdminFeedback */}
          <Route path="/admin-feedback" element={<ProtectedRoute adminOnly> <AdminFeedbackPage /> </ProtectedRoute>} />

          {/*Protected Route - AdminFeedback */}
          <Route path="/admin-businessTrip" element={<ProtectedRoute adminOnly> <BusinessTripApproval/> </ProtectedRoute>}/>

          {/*Protected Route - Admin Layout Designer */}
          <Route path="/admin-layout-designer" element={ <ProtectedRoute adminOnly> <LayoutDesigner/> </ProtectedRoute>}/>
        </Routes>
      </ParkingProvider>
    </Router>
  );
}