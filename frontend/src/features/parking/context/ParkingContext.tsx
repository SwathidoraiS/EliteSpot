import { createContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { ParkingState, Slot, SlotFilter } from '../types/parking.types';
/**
 * Defines actions for reducer.
 * Using reducer ensures predictable state transitions.
 */

interface ParkingContextType extends ParkingState {
  setSlots: (slots: Slot[]) => void;
  selectSlot: (slot: Slot) => void;
  setFilter: (filter: SlotFilter) => void;
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  clearSelection: () => void;
}

type Action =
  | { type: 'SET_SLOTS'; payload: Slot[] }
  | { type: 'SELECT_SLOT'; payload: Slot }
  | { type: 'SET_FILTER'; payload: SlotFilter }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_SELECTION' };

/**
 * Initial state for Parking Context.
 */
const initialState: ParkingState = {
  slots: [],
  selectedSlot: null,
  filter: 'all',
  loading: false,
  error: null,
};

/**
 * Reducer handles state transitions.
 * Pure function → no side effects.
 */
function parkingReducer(state: ParkingState, action: Action): ParkingState {
  switch (action.type) {
    case 'SET_SLOTS':
      return { ...state, slots: action.payload };
    case 'SELECT_SLOT':
      return { ...state, selectedSlot: action.payload };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_SELECTION':
      return { ...state, selectedSlot: null };
    default:
      return state;
  }
}

export const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

/**
 * Provider wraps the application.
 */
export function ParkingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(parkingReducer, initialState);

  const setSlots = (slots: Slot[]) => {
    dispatch({ type: 'SET_SLOTS', payload: slots });
  };
  const setFilter = (filter: SlotFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };
  const selectSlot = (slot: Slot) => {
    dispatch({ type: 'SELECT_SLOT', payload: slot });
  };
  const setLoading = (value: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: value });
  };

  const setError = (message: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: message });
  };

  const clearSelection = () => {
    dispatch({ type: 'CLEAR_SELECTION' });
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