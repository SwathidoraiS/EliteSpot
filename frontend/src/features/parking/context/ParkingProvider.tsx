import { useReducer, type ReactNode } from "react";
import type {
  SlotType,
  SlotFilter,
} from "../types/parking.types";
import {
  ParkingContext,
  initialState,
  parkingReducer,
} from "./ParkingContext";


/* =========================================================
   Provider Component
   - Wrap your app with this to access parking state globally
========================================================= */

export function ParkingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(parkingReducer, initialState);

  /* ---------- Action Dispatchers ---------- */

  const setSlots = (slots: SlotType[]) =>
    dispatch({ type: "SET_SLOTS", payload: slots });

  const selectSlot = (slot: SlotType) =>
    dispatch({ type: "SELECT_SLOT", payload: slot });

  const setFilter = (filter: SlotFilter) =>
    dispatch({ type: "SET_FILTER", payload: filter });

  const setLoading = (value: boolean) =>
    dispatch({ type: "SET_LOADING", payload: value });

  const setError = (message: string | null) =>
    dispatch({ type: "SET_ERROR", payload: message });

  const clearSelection = () =>
    dispatch({ type: "CLEAR_SELECTION" });

  return (
    <ParkingContext.Provider
      value={{
        ...state,         // Spread current state
        setSlots,
        selectSlot,
        setFilter,
        setLoading,
        setError,
        clearSelection,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
}
