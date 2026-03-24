const fs = require("fs");
const path = require("path");
const { sql } = require("../config/db");

const incomingFolder = path.join(__dirname, "../data/incoming");
const backupFolder = path.join(__dirname, "../data/backup");
let success = false;
let message = "";
const normalizePlate = (plate) => {
  if (!plate) return "";   // 🔥 handle null / undefined

  return plate
    .normalize("NFKC") 
    .replace(/\s/g, "")
    .replace(/-/g, "")
    .replace(/[０-９]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0xFEE0)
    )
    .toUpperCase();
};

const processFiles = async () => {
  try {
    const files = fs.readdirSync(incomingFolder);

    for (const file of files) {

      let success = false;
      let message = "";

      const filePath = path.join(incomingFolder, file);

      const rawData = fs.readFileSync(filePath);
      const data = JSON.parse(rawData);

      const plateNumber = data["Car number"];
      console.log("Detected Plate:", plateNumber);

      const normalizedIncoming = normalizePlate(plateNumber);

      const result = await sql.query(`SELECT * FROM users`);
      const users = result.recordset;

      const user = users.find(u =>
        normalizePlate(u.car_plate) === normalizedIncoming
      );

      if (!user) {
        message = "User not registered";
      } else {

        console.log("✅ User Found:", user.car_plate);

        const bookingResult = await sql.query(`
          SELECT * FROM Booking
          WHERE user_id = ${user.user_id} AND status IN ('BOOKED','PARKED')
        `);

        const booking = bookingResult.recordset;

        if (booking.length === 0) {
          message = "No booking found";
        } else {

          const currentBooking = booking[0];

          // 🚗 ENTRY
          if (currentBooking.status === "BOOKED") {

            const dashResult = await sql.query("SELECT * FROM dashboard WHERE id = 1");
            const dash = dashResult.recordset;

            if (dash[0].available_slots > 0) {

              await sql.query(`
                UPDATE dashboard 
                SET parked_slots = parked_slots + 1,
                    available_slots = available_slots - 1
                WHERE id = 1
              `);

              await sql.query(`
                UPDATE Booking
                SET status = 'PARKED'
                WHERE user_id = ${user.user_id}
              `);

              success = true;
              message = "ENTRY successful (slot allocated)";

            } else {
              message = "Parking full";
            }
          }

          // 🚗 EXIT
          else if (currentBooking.status === "PARKED") {

            await sql.query(`
              UPDATE dashboard 
              SET parked_slots = parked_slots - 1,
                  available_slots = available_slots + 1
              WHERE id = 1
            `);

            await sql.query(`
              UPDATE Booking
              SET status = 'COMPLETED'
              WHERE user_id = ${user.user_id}
            `);

            success = true;
            message = "EXIT successful (slot released)";
          }
        }
      }

      // 📦 Move file
      const backupPath = path.join(backupFolder, file);
      fs.renameSync(filePath, backupPath);

      console.log(`Processed & moved: ${file}`);
      console.log("Response:", { success, message });

      // 👉 If you return via API, return this:
      // return { success, message, file };

    }

  } catch (err) {
    console.error("Error processing files:", err);
  }
};

module.exports = processFiles;