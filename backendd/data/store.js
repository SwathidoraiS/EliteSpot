
// Testing data

const slots = [
  { id: "L1", status: "available" },
  { id: "L2", status: "available" },
  { id: "L3", status: "available" },
  { id: "R1", status: "available" },
  { id: "R2", status: "available" }
];
const users = [
  { id: "1", name: "Swathi", plateNumber: "TN09AB1234" }
];

const bookings = [
  {
    id: "101",
    slotId: "L1",
    plateNumber: "TN09AB1234",
    date: "2026-02-20",
    fromTime: "10:00",
    toTime: "13:00"
  }
];
const entryLogs = [];
module.exports = { slots, bookings, users, entryLogs };
