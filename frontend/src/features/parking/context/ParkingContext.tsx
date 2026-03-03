import { createContext, useReducer, useContext } from "react";
import type { ReactNode } from "react";
import type {
  ParkingState,
  SlotType,
  SlotFilter,
} from "../types/parking.types";

/* ---------- Context Type ---------- */

interface ParkingContextType extends ParkingState {
  setSlots: (slots: SlotType[]) => void;
  selectSlot: (slot: SlotType) => void;
  setFilter: (filter: SlotFilter) => void;
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  clearSelection: () => void;
}

/* ---------- Actions ---------- */

type Action =
  | { type: "SET_SLOTS"; payload: SlotType[] }
  | { type: "SELECT_SLOT"; payload: SlotType }
  | { type: "SET_FILTER"; payload: SlotFilter }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_SELECTION" };

/* ---------- Initial State ---------- */

const initialState: ParkingState = {
  slots: [],
  selectedSlot: null,
  filter: "all",
  loading: false,
  error: null,
};

/* ---------- Reducer ---------- */

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
      return state;
  }
}

/* ---------- Context ---------- */

export const ParkingContext =
  createContext<ParkingContextType | undefined>(undefined);

/* ---------- Provider ---------- */

export function ParkingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(parkingReducer, initialState);

  const setSlots = (slots: SlotType[]) => {
    dispatch({ type: "SET_SLOTS", payload: slots });
  };

  const setFilter = (filter: SlotFilter) => {
    dispatch({ type: "SET_FILTER", payload: filter });
  };

  const selectSlot = (slot: SlotType) => {
    dispatch({ type: "SELECT_SLOT", payload: slot });
  };

  const setLoading = (value: boolean) => {
    dispatch({ type: "SET_LOADING", payload: value });
  };

  const setError = (message: string | null) => {
    dispatch({ type: "SET_ERROR", payload: message });
  };

  const clearSelection = () => {
    dispatch({ type: "CLEAR_SELECTION" });
  };

  return (
    <ParkingContext.Provider
      value={{
        ...state,
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

/* ---------- Custom Hook ---------- */

export const useParking = () => {
  const context = useContext(ParkingContext);

  if (!context) {
    throw new Error("useParking must be used within ParkingProvider");
  }

  return context;
};