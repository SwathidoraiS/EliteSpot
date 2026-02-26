console.log("STORE FILE LOADED 🚀");
// ===== USERS =====
const users = [
  {
    id: "1",
    name: "Swathi",
    email: "swathi@gmail.com",
    password: "123456",
    plateNumber: "TN09AB1234"
  },
  {
    id: "2",
    name: "Arun",
    email: "arun@gmail.com",
    password: "123456",
    plateNumber: "TN10XY5678"
  }
];

// ===== SLOTS =====
const slots = [
  { id: "21-L1", status: "available" },
  { id: "21-L2", status: "available" },
  { id: "21-L3", status: "available" },
  { id: "21-L4", status: "available" },
  { id: "21-L5", status: "available" },
  { id: "21-L6", status: "available" },
  { id: "21-L7", status: "available" },
  { id: "21-L8", status: "available" },
  { id: "21-C1", status: "available" },
  { id: "21-C2", status: "available" },
  { id: "21-C3", status: "available" },
  { id: "21-C4", status: "available" },
  { id: "21-C5", status: "available" },
  { id: "21-R1", status: "available" },
  { id: "21-R2", status: "available" },
  { id: "21-R3", status: "available" },
  { id: "21-R4", status: "available" },
  { id: "21-R5", status: "available" },
  { id: "21-R6", status: "available" },
  { id: "21-R7", status: "available" },
  { id: "21-R8", status: "available" },
  { id: "R2", status: "available" },
  { id: "8-L1", status: "fixed" },
  { id: "8-L2", status: "fixed"}
];

// ===== BOOKINGS =====
const bookings = [];

// ===== ENTRY LOGS =====
const entryLogs = [];

module.exports = {
  users,
  slots,
  bookings,
  entryLogs
};