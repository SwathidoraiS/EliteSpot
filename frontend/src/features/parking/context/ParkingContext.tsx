import { createContext, useReducer, useContext } from "react";
import type { ReactNode } from "react";
import type {
  ParkingState,
  SlotType,
  SlotFilter,
} from "../types/parking.types";

/* =========================================================
   Context Type Definition
   - Extends state and adds actions (functions)
========================================================= */

interface ParkingContextType extends ParkingState {
  setSlots: (slots: SlotType[]) => void;
  selectSlot: (slot: SlotType) => void;
  setFilter: (filter: SlotFilter) => void;
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  clearSelection: () => void;
}

/* =========================================================
   Action Types for Reducer
========================================================= */

type Action =
  | { type: "SET_SLOTS"; payload: SlotType[] }
  | { type: "SELECT_SLOT"; payload: SlotType }
  | { type: "SET_FILTER"; payload: SlotFilter }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_SELECTION" };

/* =========================================================
   Initial State
========================================================= */

const initialState: ParkingState = {
  slots: [],           // All parking slots
  selectedSlot: null,  // Currently selected slot ID
  filter: "all",       // Current filter (all / available / etc.)
  loading: false,      // Loading state for API calls
  error: null,         // Error message (if any)
};

/* =========================================================
   Reducer Function
   - Handles all state updates based on action type
========================================================= */

function parkingReducer(
  state: ParkingState,
  action: Action
): ParkingState {
  switch (action.type) {
    case "SET_SLOTS":
      return { ...state, slots: action.payload };

    case "SELECT_SLOT":
      return { ...state, selectedSlot: action.payload.id };

    case "SET_FILTER":
      return { ...state, filter: action.payload };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "CLEAR_SELECTION":
      return { ...state, selectedSlot: null };

    default:
      return state; // fallback (should not happen)
  }
}

/* =========================================================
   Create Context
========================================================= */

export const ParkingContext =
  createContext<ParkingContextType | undefined>(undefined);

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