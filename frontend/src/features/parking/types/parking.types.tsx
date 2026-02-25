export type SlotState =
  | "available"
  | "selected"
  | "reserved"
  | "disabled";

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
