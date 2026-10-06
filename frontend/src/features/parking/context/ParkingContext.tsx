import { createContext } from "react";
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

export const initialState: ParkingState = {
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

export function parkingReducer(
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
