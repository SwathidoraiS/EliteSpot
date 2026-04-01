// Slot State Type
export type SlotState =
  | "available"
  | "selected"
  | "reserved"
  | "fixed"
  | "parked";

// Slot Type
export type SlotType = {
  id: string;
  state: SlotState;   
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

//  Slot Filter Type
export type SlotFilter = "all" | "available" | "reserved" | "fixed";

//  Parking State
export type ParkingState = {
  slots: SlotType[];
  filter: SlotFilter;
  selectedSlot: string | null;
  loading: boolean;
  error: string | null;
};