const { users, bookings, slots, entryLogs } = require("../data/store");

// ================= ENTRY =================
const processEntry = async ({ plateNumber, entryTime }) => {

  if (!plateNumber || !entryTime) {
    throw new Error("Plate number and entry time required");
  }

  // 1️⃣ Check user
  const user = users.find(u => u.plateNumber === plateNumber);
  if (!user) {
    throw new Error("Vehicle not registered");
  }

  // 2️⃣ Check booking
  const booking = bookings.find(b => b.plateNumber === plateNumber);
  if (!booking) {
    throw new Error("No booking found");
  }

  // 3️⃣ 1-HOUR RULE
  const bookingStart = new Date(`${booking.date}T${booking.fromTime}:00`);
  const entryDateTime = new Date(entryTime);
  const oneHourLimit = new Date(bookingStart.getTime() + 60 * 60 * 1000);

  if (entryDateTime > oneHourLimit) {

    // Release slot
    const slot = slots.find(s => s.id === booking.slotId);
    if (slot) slot.status = "available";

    // Remove booking
    const index = bookings.findIndex(b => b.id === booking.id);
    if (index !== -1) bookings.splice(index, 1);

    throw new Error("Booking expired. Slot released.");
  }

  // 4️⃣ Mark slot parked
  const slot = slots.find(s => s.id === booking.slotId);
  if (slot) slot.status = "parked";

  // 5️⃣ Save entry log
  entryLogs.push({
    plateNumber,
    slotId: booking.slotId,
    entryTime
  });

  return {
    success: true,
    message: "Vehicle parked successfully",
    slot: booking.slotId
  };
};

// ================= EXIT =================
const processExit = async ({ plateNumber, exitTime }) => {

  if (!plateNumber || !exitTime) {
    throw new Error("Plate number and exit time required");
  }

  // Find booking
  const booking = bookings.find(b => b.plateNumber === plateNumber);
  if (!booking) {
    throw new Error("No active booking found");
  }

  // Find slot
  const slot = slots.find(s => s.id === booking.slotId);
  if (!slot || slot.status !== "parked") {
    throw new Error("Vehicle not currently parked");
  }

  // Mark available
  slot.status = "available";

  // Remove booking
  const index = bookings.findIndex(b => b.id === booking.id);
  if (index !== -1) bookings.splice(index, 1);

  // Save exit log
  entryLogs.push({
    plateNumber,
    slotId: slot.id,
    exitTime
  });

  return {
    success: true,
    message: "Vehicle exited successfully",
    slot: slot.id
  };
};

module.exports = {
  processEntry,
  processExit
};