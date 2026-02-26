export type SlotState =
  | "available"
  | "selected"
  | "reserved"
  | "fixed";

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
