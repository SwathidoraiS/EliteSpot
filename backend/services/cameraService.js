const { users, bookings, slots, entryLogs } = require("../data/store");

// ================= ENTRY =================
const processEntry = async ({ plateNumber, entryTime }) => {

<<<<<<< HEAD
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
=======
const normalizePlate = (plate) => {
  if (!plate) return "";

  return plate
    .normalize("NFKC")
    .replace(/\s/g, "")
    .replace(/-/g, "")
    .replace(/[０-９]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0xFEE0)
    )
    .toUpperCase();
};

// 📁 Save incoming JSON
const saveCameraJson = (data) => {
  const fileName = `car_${Date.now()}.json`;

  const filePath = path.join(__dirname, "../data/incoming", fileName);
  console.log("📁 Saving to incoming:", filePath);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  return fileName;
};

// 🚗 Save ENTRY log
const saveParkingLog = async (plateNumber) => {
  await sql.query(`
    INSERT INTO parking_logs (plate_number, event_type)
    VALUES ('${plateNumber}', 'ENTRY')
  `);
};

// 🚗 HANDLE ENTRY
const handleCarEntry = async (plateNumber) => {

  const logCheck = await sql.query(`
    SELECT TOP 1 * FROM parking_logs
    WHERE plate_number = '${plateNumber}'
    ORDER BY timestamp DESC
  `);

  const lastLog = logCheck.recordset[0];

  if (lastLog && lastLog.event_type === 'ENTRY') {
    return { success: false, message: "Car already inside" };
  }

  const userResult = await sql.query(`SELECT * FROM users`);
const users = userResult.recordset;

const normalizedIncoming = normalizePlate(plateNumber);

const user = users.find(u =>
  normalizePlate(u.car_plate) === normalizedIncoming
);


  if (users.length === 0) {
    return { success: false, message: "User not found" };
  }

  if (!user) {
  return { success: false, message: "User not found" };
}

  const bookingResult = await sql.query(`
    SELECT * FROM Booking
    WHERE user_id = ${user.user_id} AND status = 'BOOKED'
  `);

  const bookings = bookingResult.recordset;

  if (bookings.length === 0) {
    return { success: false, message: "No booking found" };
  }

  await sql.query(`
    UPDATE dashboard 
    SET parked_slots = parked_slots + 1
  `);

  await sql.query(`
    UPDATE Booking
    SET status = 'PARKED'
    WHERE user_id = ${user.user_id}
  `);

  return { success: true, message: "ENTRY successful" };
>>>>>>> 701457f (updated)
};

// ================= EXIT =================
const processExit = async ({ plateNumber, exitTime }) => {

<<<<<<< HEAD
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

=======
  const logCheck = await sql.query(`
    SELECT TOP 1 * FROM parking_logs
    WHERE plate_number = '${plateNumber}'
    ORDER BY timestamp DESC
  `);

  const lastLog = logCheck.recordset[0];

  if (!lastLog || lastLog.event_type !== 'ENTRY') {
    return { success: false, message: "Car not inside" };
  }

  await sql.query(`
    UPDATE dashboard 
    SET parked_slots = 
      CASE WHEN parked_slots > 0 THEN parked_slots - 1 ELSE 0 END
  `);

  await sql.query(`
    UPDATE Booking
    SET status = 'COMPLETED'
    WHERE user_id IN (
      SELECT user_id FROM users WHERE car_plate = '${plateNumber}'
    )
  `);

  return { success: true, message: "EXIT successful" };
};
// ✅ SINGLE EXPORT (IMPORTANT)
>>>>>>> 701457f (updated)
module.exports = {
  processEntry,
  processExit
};