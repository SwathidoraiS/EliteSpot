import { useContext } from "react";
import { ParkingContext } from "./ParkingContext";
/* =========================================================
   Custom Hook
   - Simplifies usage of ParkingContext
========================================================= */

export const useParking = () => {
  const context = useContext(ParkingContext);

  if (!context) {
    throw new Error("useParking must be used within ParkingProvider");
  }

  return context;
};