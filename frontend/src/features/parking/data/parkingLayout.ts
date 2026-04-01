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
  createSlot("8-L1", 40, 1, "fixed"),
  createSlot("8-L2", 80, 1, "fixed"),
  createSlot("8-L3", 120, 1, "fixed"),
  createSlot("8-L4", 160, 1, "fixed"),
  createSlot("8-L5", 200, 1, "fixed"),
  createSlot("8-L6", 240, 1, "fixed"),
  createSlot("8-L7", 280, 1, "fixed"),
  createSlot("8-L8", 320, 1, "fixed"),

  

  /* ================= ROW 20 ================= */

  // LEFT BLOCK
  createSlot("20-L1", 40, 60, "fixed"),
  createSlot("20-L2", 80, 60, "fixed"),
  createSlot("20-L3", 120, 60, "fixed"),
  createSlot("20-L4", 160, 60, "fixed"),
  createSlot("20-L5", 200, 60, "fixed"),
  createSlot("20-L6", 240, 60, "fixed"),
  createSlot("20-L7", 280, 60, "fixed"),
  createSlot("20-L8", 320, 60, "fixed"),
  createSlot("20-L9", 360, 60,"fixed"),

  // CENTER BLOCK
  createSlot("20-C1", 470, 60, "fixed"),
  createSlot("20-C2", 510, 60, "fixed"),
  createSlot("20-C3", 550, 60, "fixed"),
  createSlot("20-C4", 590, 60, "fixed"),

  // RIGHT BLOCK
  createSlot("20-R1", 650, 60, "fixed"),
  createSlot("20-R2", 690, 60, "fixed"),
  createSlot("20-R3", 730, 60, "fixed"),
  createSlot("20-R4", 770, 60, "fixed"),
  createSlot("20-R5", 810, 60, "fixed"),
  createSlot("20-R6", 850, 60, "fixed"),
  createSlot("20-R7", 890, 60, "fixed"),



  /* ================= ROW 18 ================= */

  // LEFT BLOCK
  createSlot("18-L1", 80, 160, "fixed"),
  createSlot("18-L2", 120, 160, "fixed"),
  createSlot("18-L3", 160, 160, "fixed"),
  createSlot("18-L4", 200, 160, "fixed"),
  createSlot("18-L5", 240, 160, "fixed"),
  createSlot("18-L6", 280, 160, "fixed"),
  createSlot("18-L7", 320, 160, "fixed"),
  createSlot("18-L8", 360, 160, "fixed"),

  // CENTER BLOCK
  createSlot("18-C1", 470, 160, "fixed"),
  createSlot("18-C2", 510, 160, "fixed"),
  createSlot("18-C3", 550, 160, "fixed"),
  createSlot("18-C4", 590, 160, "fixed"),

  // RIGHT BLOCK
  createSlot("18-R1", 635, 160, "fixed"),
  createSlot("18-R2", 675, 160, "fixed"),
  createSlot("18-R3", 715, 160, "fixed"),
  createSlot("18-R4", 755, 160, "fixed"),
  createSlot("18-R5", 795, 160, "fixed"),
  createSlot("18-R6", 835, 160, "fixed"),


  /* ================= ROW 17 ================= */

  // LEFT BLOCK
  createSlot("17-L1", 120, 220, "fixed"),
  createSlot("17-L2", 160, 220, "fixed"),
  createSlot("17-L3", 200, 220, "fixed"),
  createSlot("17-L4", 240, 220, "fixed"),
  createSlot("17-L5", 280, 220, "fixed"),
  createSlot("17-L6", 320, 220, "fixed"),
  createSlot("17-L7", 360, 220, "fixed"),

  // CENTER BLOCK
  createSlot("17-C1", 470, 220, "fixed"),
  createSlot("17-C2", 510, 220, "fixed"),
  createSlot("17-C3", 550, 220, "fixed"),
  createSlot("17-C4", 590, 220, "fixed"),

  // RIGHT BLOCK
  createSlot("17-R1", 635, 220, "fixed"),
  createSlot("17-R2", 675, 220, "fixed"),
  createSlot("17-R3", 715, 220, "fixed"),
  createSlot("17-R4", 755, 220, "fixed"),
  createSlot("17-R5", 795, 220, "fixed"),
  createSlot("17-R6", 835, 220, "fixed"),


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
  createSlot("21-R2", 660, 320, "available"),
  createSlot("21-R3", 700, 320, "available"),
  createSlot("21-R4", 740, 320, "available"),
  createSlot("21-R5", 780, 320, "available"),
  createSlot("21-R6", 820, 320, "available"),
  createSlot("21-R7", 860, 320, "available"),
  createSlot("21-R8", 900, 320, "available"),
];


