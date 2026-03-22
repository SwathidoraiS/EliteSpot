const fs = require("fs");
const path = require("path");
const { sql } = require("../config/db");

const incomingFolder = path.join(__dirname, "../data/incoming");
const backupFolder = path.join(__dirname, "../data/backup");

const processFiles = async () => {
  try {
    const files = fs.readdirSync(incomingFolder);

    for (const file of files) {
      const filePath = path.join(incomingFolder, file);

      // Read JSON file
      const rawData = fs.readFileSync(filePath);
      const data = JSON.parse(rawData);

      // 👇 Extract plate number (based on your image)
      const plateNumber = data["Car number"];

      console.log("Detected Plate:", plateNumber);

      // 🔍 Check if registered
      // Check user
    const result = await sql.query(`
    SELECT * FROM users WHERE car_plate = '${plateNumber}'
    `);

    const users = result.recordset;

if (users.length === 0) {
  console.log("❌ Not registered");
} else {
  const user = users[0];

  // Check booking
  const bookingResult = await sql.query(`
    SELECT * FROM bookings 
    WHERE user_id = ${user.id} AND status = 'BOOKED'
    `);

    const booking = bookingResult.recordset;

  if (booking.length > 0) {

    // Check dashboard
    const dashResult = await sql.query("SELECT * FROM dashboard WHERE id = 1");
    const dash = dashResult.recordset;

    if (dash[0].available_slots > 0) {

      // Update dashboard
      await sql.query(`
        UPDATE dashboard 
        SET parked_slots = parked_slots + 1,
            available_slots = available_slots - 1
        WHERE id = 1
        `);

      // Update booking
      await sql.query(`
        UPDATE bookings 
        SET status = 'PARKED'
        WHERE user_id = ${user.id} AND status = 'BOOKED'
        `);

      console.log("✅ Slot allocated");

    } else {
      console.log("🚫 Parking Full");
    }
  }
}

      // 📦 Move file to backup
      const backupPath = path.join(backupFolder, file);
      fs.renameSync(filePath, backupPath);

      console.log(`Processed & moved: ${file}`);
    }
  } catch (err) {
    console.error("Error processing files:", err);
  }
};

module.exports = processFiles;