export type SlotType = {
  id: string;
  state: "available" | "disabled";
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

const SLOT_WIDTH = 35;
const SLOT_HEIGHT = 55;

const createSlot = (
  id: string,
  x: number,
  y: number,
  state: "available" | "disabled"
): SlotType => ({
  id,
  state,
  position: { x, y, width: SLOT_WIDTH, height: SLOT_HEIGHT }
});

export const initialSlots: SlotType[] = [

  /* ================= ROW 8 (TOP) ================= */

  // LEFT BLOCK
  createSlot("8-L1", 40, 20, "disabled"),
  createSlot("8-L2", 80, 20, "disabled"),
  createSlot("8-L3", 120, 20, "disabled"),
  createSlot("8-L4", 160, 20, "disabled"),
  createSlot("8-L5", 200, 20, "disabled"),
  createSlot("8-L6", 240, 20, "disabled"),
  createSlot("8-L7", 280, 20, "disabled"),
  createSlot("8-L8", 320, 20, "disabled"),

  

  /* ================= ROW 20 ================= */

  // LEFT BLOCK
  createSlot("20-L1", 40, 80, "disabled"),
  createSlot("20-L2", 80, 80, "disabled"),
  createSlot("20-L3", 120, 80, "disabled"),
  createSlot("20-L4", 160, 80, "disabled"),
  createSlot("20-L5", 200, 80, "disabled"),
  createSlot("20-L6", 240, 80, "disabled"),
  createSlot("20-L7", 280, 80, "disabled"),
  createSlot("20-L8", 320, 80, "disabled"),
  createSlot("20-L9", 360, 80,"disabled"),

  // CENTER BLOCK
  createSlot("20-C1", 470, 80, "disabled"),
  createSlot("20-C2", 510, 80, "disabled"),
  createSlot("20-C3", 550, 80, "disabled"),
  createSlot("20-C4", 590, 80, "disabled"),

  // RIGHT BLOCK
  createSlot("20-R1", 650, 80, "disabled"),
  createSlot("20-R2", 690, 80, "disabled"),
  createSlot("20-R3", 730, 80, "disabled"),
  createSlot("20-R4", 770, 80, "disabled"),
  createSlot("20-R5", 810, 80, "disabled"),
  createSlot("20-R6", 850, 80, "disabled"),
  createSlot("20-R7", 890, 80, "disabled"),



  /* ================= ROW 18 ================= */

  // LEFT BLOCK
  createSlot("18-L1", 80, 180, "disabled"),
  createSlot("18-L2", 120, 180, "disabled"),
  createSlot("18-L3", 160, 180, "disabled"),
  createSlot("18-L4", 200, 180, "disabled"),
  createSlot("18-L5", 240, 180, "disabled"),
  createSlot("18-L6", 280, 180, "disabled"),
  createSlot("18-L7", 320, 180, "disabled"),
  createSlot("18-L8", 360, 180, "disabled"),

  // CENTER BLOCK
  createSlot("18-C1", 470, 180, "disabled"),
  createSlot("18-C2", 510, 180, "disabled"),
  createSlot("18-C3", 550, 180, "disabled"),
  createSlot("18-C4", 590, 180, "disabled"),

  // RIGHT BLOCK
  createSlot("18-R1", 635, 180, "disabled"),
  createSlot("18-R2", 675, 180, "disabled"),
  createSlot("18-R3", 715, 180, "disabled"),
  createSlot("18-R4", 755, 180, "disabled"),
  createSlot("18-R5", 795, 180, "disabled"),
  createSlot("18-R6", 835, 180, "disabled"),


  /* ================= ROW 17 ================= */

  // LEFT BLOCK
  createSlot("17-L1", 120, 240, "disabled"),
  createSlot("17-L2", 160, 240, "disabled"),
  createSlot("17-L3", 200, 240, "disabled"),
  createSlot("17-L4", 240, 240, "disabled"),
  createSlot("17-L5", 280, 240, "disabled"),
  createSlot("17-L6", 320, 240, "disabled"),
  createSlot("17-L7", 360, 240, "disabled"),

  // CENTER BLOCK
  createSlot("17-C1", 470, 240, "disabled"),
  createSlot("17-C2", 510, 240, "disabled"),
  createSlot("17-C3", 550, 240, "disabled"),
  createSlot("17-C4", 590, 240, "disabled"),

  // RIGHT BLOCK
  createSlot("17-R1", 635, 240, "disabled"),
  createSlot("17-R2", 675, 240, "disabled"),
  createSlot("17-R3", 715, 240, "disabled"),
  createSlot("17-R4", 755, 240, "disabled"),
  createSlot("17-R5", 795, 240, "disabled"),
  createSlot("17-R6", 835, 240, "disabled"),


  /* ================= ROW 21 (BOTTOM LONG ROW) ================= */

  // LEFT SIDE
  createSlot("21-L1", 80, 340, "available"),
  createSlot("21-L2", 120, 340, "available"),
  createSlot("21-L3", 160, 340, "available"),
  createSlot("21-L4", 200, 340, "available"),
  createSlot("21-L5", 240, 340, "available"),
  createSlot("21-L6", 280, 340, "available"),
  createSlot("21-L7", 320, 340, "available"),
  createSlot("21-L8", 360, 340, "available"),

  // CENTER
  createSlot("21-C1", 410, 340, "available"),
  createSlot("21-C2", 450, 340, "available"),
  createSlot("21-C3", 490, 340, "available"),
  createSlot("21-C4", 530, 340, "available"),
  createSlot("21-C5", 570, 340, "available"),

  // RIGHT SIDE
  createSlot("21-R1", 620, 340, "available"),
  createSlot("21-R2", 660, 340, "available"),
  createSlot("21-R3", 700, 340, "available"),
  createSlot("21-R4", 740, 340, "available"),
  createSlot("21-R5", 780, 340, "available"),
  createSlot("21-R6", 820, 340, "available"),
  createSlot("21-R7", 860, 340, "available"),
  createSlot("21-R8", 900, 340, "available"),
];


