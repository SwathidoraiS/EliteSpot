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
  { id: "L1", status: "available" },
  { id: "L2", status: "available" },
  { id: "L3", status: "available" },
  { id: "R1", status: "available" },
  { id: "R2", status: "available" }
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