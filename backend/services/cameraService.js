const { sql } = require("../config/db");

const fs = require("fs");
const path = require("path");

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

  // ✅ Check latest log
  const logCheck = await sql.query(`
    SELECT TOP 1 * FROM parking_logs
    WHERE plate_number = '${plateNumber}'
    ORDER BY timestamp DESC
  `);

  const lastLog = logCheck.recordset[0];

  if (lastLog && lastLog.event_type === 'ENTRY') {
    console.log("⚠️ Car already inside");
    return false;
  }

  // 1. Check user
  const userResult = await sql.query(`
    SELECT * FROM users WHERE car_plate = '${plateNumber}'
  `);

  const users = userResult.recordset;

  if (users.length === 0) {
    console.log("❌ User not found");
    return false;
  }

  const user = users[0];

  // 2. Check booking
  const bookingResult = await sql.query(`
    SELECT * FROM Booking
    WHERE user_id = ${user.user_id} AND status = 'BOOKED'
  `);

  const bookings = bookingResult.recordset;

  if (bookings.length === 0) {
    console.log("❌ No booking found");
    return false;
  }

  // 3. Update dashboard
  await sql.query(`
    UPDATE dashboard 
    SET parked_slots = parked_slots + 1
  `);

  // 4. Update booking
  await sql.query(`
    UPDATE Booking
    SET status = 'PARKED'
    WHERE user_id = ${user.user_id} AND status = 'BOOKED'
  `);

  console.log("✅ Car entered, parking updated");

  return true;
};

// 🚪 HANDLE EXIT
const handleCarExit = async (plateNumber) => {

  // ✅ Check latest log
  const logCheck = await sql.query(`
    SELECT TOP 1 * FROM parking_logs
    WHERE plate_number = '${plateNumber}'
    ORDER BY timestamp DESC
  `);

  const lastLog = logCheck.recordset[0];

  if (!lastLog || lastLog.event_type !== 'ENTRY') {
    console.log("⚠️ Car is not inside");
    return false;
  }

  // 1. Reduce parking count
  await sql.query(`
    UPDATE dashboard 
    SET parked_slots = 
      CASE WHEN parked_slots > 0 THEN parked_slots - 1 ELSE 0 END
  `);

  // 2. Update booking
  await sql.query(`
    UPDATE Booking
    SET status = 'COMPLETED'
    WHERE user_id IN (
      SELECT user_id FROM users WHERE car_plate = '${plateNumber}'
    )
    AND status = 'PARKED'
  `);

  console.log("🚗 Car exited, parking reduced");

  return true;
};

// ✅ SINGLE EXPORT (IMPORTANT)
module.exports = {
  saveCameraJson,
  saveParkingLog,
  handleCarEntry,
  handleCarExit
};