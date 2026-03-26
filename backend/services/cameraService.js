const { sql } = require("../config/db");

const fs = require("fs");
const path = require("path");

// 🔥 Normalize plate (IMPORTANT for Japanese plates)
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

// ================= ENTRY =================
const handleCarEntry = async (plateNumber) => {

  const logCheck = await sql.query(`
    SELECT TOP 1 * FROM parking_logs
    WHERE plate_number = '${plateNumber}'
    ORDER BY timestamp DESC
  `);

  const lastLog = logCheck.recordset[0];

  if (lastLog && lastLog.event_type === "ENTRY") {
    return { success: false, message: "Car already inside" };
  }

  // 🔥 get all users
  const userResult = await sql.query(`SELECT * FROM users`);
  const users = userResult.recordset;

  const normalizedIncoming = normalizePlate(plateNumber);

  const user = users.find(u =>
    normalizePlate(u.car_plate) === normalizedIncoming
  );

  if (!user) {
    return { success: false, message: "User not found" };
  }

  // 🔥 check booking
  const bookingResult = await sql.query(`
    SELECT TOP 1 * FROM Booking
    WHERE user_id = ${user.user_id}
    AND status = 'BOOKED'
    ORDER BY booking_start DESC
  `);

  const booking = bookingResult.recordset[0];

  if (booking.length === 0) {
    return { success: false, message: "No booking found" };
  }

  // 🔥 update dashboard
  await sql.query(`
    UPDATE dashboard 
    SET parked_slots = parked_slots + 1
  `);

  // 🔥 update booking
  await sql.query(`
    UPDATE Booking
    SET status = 'PARKED'
    WHERE booking_id = ${booking.booking_id}
  `);

  return { success: true, message: "ENTRY successful" };
};

// ================= EXIT =================
const handleCarExit = async (plateNumber) => {

  const normalizedPlate = normalizePlate(plateNumber); // ✅ ADD THIS

  const logCheck = await sql.query(`
    SELECT TOP 1 * FROM parking_logs
    WHERE plate_number = '${plateNumber}'
    ORDER BY timestamp DESC
  `);

  const lastLog = logCheck.recordset[0];

  if (!lastLog || lastLog.event_type !== "ENTRY") {
    return { success: false, message: "Car not inside" };
  }

  // 🔥 find user using normalized plate
  const userResult = await sql.query(`SELECT * FROM users`);
  const users = userResult.recordset;

  const user = users.find(u =>
    normalizePlate(u.car_plate) === normalizedPlate
  );

  if (!user) {
    return { success: false, message: "User not found" };
  }

  // ✅ reduce parking count
  await sql.query(`
    UPDATE dashboard 
    SET parked_slots = 
      CASE WHEN parked_slots > 0 THEN parked_slots - 1 ELSE 0 END
  `);

  // ✅ CLEAR booking (THIS IS THE MAIN FIX)
  await sql.query(`
    UPDATE Booking
    SET status = 'COMPLETED'
    WHERE user_id = ${user.user_id}
    AND status = 'PARKED'
  `);

  return { success: true, message: "EXIT successful" };
};

// ✅ EXPORT
module.exports = {
  saveCameraJson,
  saveParkingLog,
  handleCarEntry,
  handleCarExit
};