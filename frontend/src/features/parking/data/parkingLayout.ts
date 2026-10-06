// Slot Type Definition

export type SlotType = {
  id: string;
  status: "available" | "fixed";
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

// Constants (Reusable Dimensions)
const SLOT_WIDTH = 35;
const SLOT_HEIGHT = 55;

// Utility Function to Create Slot
const createSlot = (
  id: string,
  x: number,
  y: number,
  status: "available" | "fixed"
): SlotType => ({
  id,
  status,
  position: { x, y, width: SLOT_WIDTH, height: SLOT_HEIGHT }
});

// Initial Slot Layout
export const initialSlots: SlotType[] = [

  /* ================= ROW 8 (TOP) ================= */

  // LEFT BLOCK
  createSlot("8-L1", 40, 25, "fixed"),
  createSlot("8-L2", 80, 25, "fixed"),
  createSlot("8-L3", 120, 25, "fixed"),
  createSlot("8-L4", 160, 25, "fixed"),
  createSlot("8-L5", 200, 25, "fixed"),
  createSlot("8-L6", 240, 25, "fixed"),
  createSlot("8-L7", 280, 25, "fixed"),
  createSlot("8-L8", 320, 25, "fixed"),

  

  /* ================= ROW 20 ================= */

  // LEFT BLOCK
  createSlot("20-L1", 40, 85, "fixed"),
  createSlot("20-L2", 80, 85, "fixed"),
  createSlot("20-L3", 120, 85, "fixed"),
  createSlot("20-L4", 160, 85, "fixed"),
  createSlot("20-L5", 200, 85, "fixed"),
  createSlot("20-L6", 240, 85, "fixed"),
  createSlot("20-L7", 280, 85, "fixed"),
  createSlot("20-L8", 320, 85, "fixed"),
  createSlot("20-L9", 360, 85,"fixed"),

  // CENTER BLOCK
  createSlot("20-C1", 470, 85, "fixed"),
  createSlot("20-C2", 510, 85, "fixed"),
  createSlot("20-C3", 550, 85, "fixed"),
  createSlot("20-C4", 590, 85, "fixed"),

  // RIGHT BLOCK
  createSlot("20-R1", 650, 85, "fixed"),
  createSlot("20-R2", 690, 85, "fixed"),
  createSlot("20-R3", 730, 85, "fixed"),
  createSlot("20-R4", 770, 85, "fixed"),
  createSlot("20-R5", 810, 85, "fixed"),
  createSlot("20-R6", 850, 85, "fixed"),
  createSlot("20-R7", 890, 85, "fixed"),



  /* ================= ROW 18 ================= */

  // LEFT BLOCK
  createSlot("18-L1", 80, 170, "fixed"),
  createSlot("18-L2", 120, 170, "fixed"),
  createSlot("18-L3", 160, 170, "fixed"),
  createSlot("18-L4", 200, 170, "fixed"),
  createSlot("18-L5", 240, 170, "fixed"),
  createSlot("18-L6", 280, 170, "fixed"),
  createSlot("18-L7", 320, 170, "fixed"),
  createSlot("18-L8", 360, 170, "fixed"),

  // CENTER BLOCK
  createSlot("18-C1", 470, 170, "fixed"),
  createSlot("18-C2", 510, 170, "fixed"),
  createSlot("18-C3", 550, 170, "fixed"),
  createSlot("18-C4", 590, 170, "fixed"),

  // RIGHT BLOCK
  createSlot("18-R1", 635, 170, "fixed"),
  createSlot("18-R2", 675, 170, "fixed"),
  createSlot("18-R3", 715, 170, "fixed"),
  createSlot("18-R4", 755, 170, "fixed"),
  createSlot("18-R5", 795, 170, "fixed"),
  createSlot("18-R6", 835, 170, "fixed"),


  /* ================= ROW 17 ================= */

  // LEFT BLOCK
  createSlot("17-L1", 120, 230, "fixed"),
  createSlot("17-L2", 160, 230, "fixed"),
  createSlot("17-L3", 200, 230, "fixed"),
  createSlot("17-L4", 240, 230, "fixed"),
  createSlot("17-L5", 280, 230, "fixed"),
  createSlot("17-L6", 320, 230, "fixed"),
  createSlot("17-L7", 360, 230, "fixed"),

  // CENTER BLOCK
  createSlot("17-C1", 470, 230, "fixed"),
  createSlot("17-C2", 510, 230, "fixed"),
  createSlot("17-C3", 550, 230, "fixed"),
  createSlot("17-C4", 590, 230, "fixed"),

  // RIGHT BLOCK
  createSlot("17-R1", 635, 230, "fixed"),
  createSlot("17-R2", 675, 230, "fixed"),
  createSlot("17-R3", 715, 230, "fixed"),
  createSlot("17-R4", 755, 230, "fixed"),
  createSlot("17-R5", 795, 230, "fixed"),
  createSlot("17-R6", 835, 230, "fixed"),


  /* ================= ROW 21 (BOTTOM LONG ROW) ================= */

  // LEFT SIDE
  createSlot("21-L1", 80, 320, "available"),
  createSlot("21-L2", 120, 320, "available"),
  createSlot("21-L3", 160, 320, "available"),
  createSlot("21-L4", 200, 320, "available"),
  createSlot("21-L5", 240, 320, "available"),
  createSlot("21-L6", 280, 320, "available"),
  createSlot("21-L7", 320, 320, "available"),
  createSlot("21-L8", 360, 320, "available"),

  // CENTER
  createSlot("21-C1", 410, 320, "available"),
  createSlot("21-C2", 450, 320, "available"),
  createSlot("21-C3", 490, 320, "available"),
  createSlot("21-C4", 530, 320, "available"),
  createSlot("21-C5", 570, 320, "available"),

  // RIGHT SIDE
  createSlot("21-R1", 620, 320, "available"),
  createSlot("21-R2", 660, 320, "fixed"),
  createSlot("21-R3", 700, 320, "fixed"),
  createSlot("21-R4", 740, 320, "fixed"),
  createSlot("21-R5", 780, 320, "fixed"),
  createSlot("21-R6", 820, 320, "fixed"),
  createSlot("21-R7", 860, 320, "fixed"),
  createSlot("21-R8", 900, 320, "fixed"),
];


