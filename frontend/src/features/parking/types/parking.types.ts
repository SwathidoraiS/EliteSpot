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
    rotate?: number;
  };
  booking?: Booking;
};
export interface Booking {
  booking_id: string;
  slot_id: string;
  status: string;
  booking_start: string;
  booking_end: string;
}

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