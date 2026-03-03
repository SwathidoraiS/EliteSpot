export type SlotState =
  | "available"
  | "selected"
  | "reserved"
  | "fixed"
  | "parked";

export type SlotType = {
  id: string;
  state: SlotState;   // IMPORTANT: use state not status
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type SlotFilter = "all" | "available" | "reserved" | "fixed";

export type ParkingState = {
  slots: SlotType[];
  filter: SlotFilter;
  selectedSlot: string | null;
  loading: boolean;
  error: string | null;
};