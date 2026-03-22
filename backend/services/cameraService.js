const { sql } = require("../config/db");

const fs = require("fs");
const path = require("path");

const saveCameraJson = (data) => {
  const fileName = `car_${Date.now()}.json`;

  const filePath = path.join(__dirname, "../data/incoming", fileName);
  console.log("📁 Saving to incoming:", filePath);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  return fileName;
};

module.exports = { saveCameraJson };

//Car entry save
const saveParkingLog = async (plateNumber) => {
  await sql.query(`
    INSERT INTO parking_logs (plate_number, event_type)
    VALUES ('${plateNumber}', 'ENTRY')
  `);
};

module.exports = { saveCameraJson, saveParkingLog };

const handleCarEntry = async (plateNumber) => {

  // 🔒 Check if already parked
const logCheck = await sql.query(`
  SELECT * FROM parking_logs 
  WHERE plate_number = '${plateNumber}'
  AND event_type = 'ENTRY'
`);

const logs = logCheck.recordset;

if (logs.length > 0) {
  console.log("⚠️ Car already entered, skipping");
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

  console.log("✅ Parking count updated");

  return true;
};

module.exports = { saveCameraJson, saveParkingLog, handleCarEntry };