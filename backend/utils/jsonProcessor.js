const fs = require("fs");
const path = require("path");
const { sql } = require("../config/db");

// Folder paths
const incomingFolder = path.join(__dirname, "../data/incoming");
const backupFolder = path.join(__dirname, "../data/backup");

/**
 * Normalize vehicle plate (supports Japanese full-width → half-width)
 * Removes spaces, dashes, and ensures uppercase
 */
const normalizePlate = (plate) => {
  if (!plate) return "";

  return plate
    .normalize("NFKC") // Convert full-width → half-width
    .replace(/\s/g, "") // Remove spaces
    .replace(/-/g, "")  // Remove dashes
    .replace(/[０-９]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0xFEE0)
    ) // Convert full-width digits
    .toUpperCase();
};

/**
 * Main function to process incoming JSON files
 */
const processFiles = async () => {
  try {
    // Read all files from incoming folder
    const files = fs.readdirSync(incomingFolder);

    for (const file of files) {
      let success = false;
      let message = "";

      const filePath = path.join(incomingFolder, file);

      try {
        // Read & parse JSON file
        const rawData = fs.readFileSync(filePath);
        const data = JSON.parse(rawData);

        const plateNumber = data["Car number"];
        console.log("🚗 Detected Plate:", plateNumber);

        const normalizedIncoming = normalizePlate(plateNumber);

        // Fetch all users
        const result = await sql.query(`SELECT * FROM users`);
        const users = result.recordset;

        // Find matching user by normalized plate
        const user = users.find(
          (u) => normalizePlate(u.car_plate) === normalizedIncoming
        );

        if (!user) {
          message = "User not registered";
        } else {
          console.log("✅ User Found:", user.car_plate);

          // Fetch active booking
          const bookingResult = await sql.query(`
            SELECT * FROM Booking
            WHERE user_id = ${user.user_id} 
            AND status IN ('BOOKED','PARKED')
          `);

          const booking = bookingResult.recordset;

          if (booking.length === 0) {
            message = "No booking found";
          } else {
            const currentBooking = booking[0];

            // 🚗 ENTRY FLOW
            if (currentBooking.status === "BOOKED") {
              const dashResult = await sql.query(
                "SELECT * FROM dashboard WHERE id = 1"
              );
              const dash = dashResult.recordset[0];

              if (dash.available_slots > 0) {
                // Update dashboard counts
                await sql.query(`
                  UPDATE dashboard 
                  SET parked_slots = parked_slots + 1,
                      available_slots = available_slots - 1
                  WHERE id = 1
                `);

                // Update booking status
                await sql.query(`
                  UPDATE Booking
                  SET status = 'PARKED'
                  WHERE user_id = ${user.user_id}
                `);

                success = true;
                message = "ENTRY successful";
              } else {
                message = "Parking full";
              }
            }

            // 🚗 EXIT FLOW
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
              message = "EXIT successful";
            }
          }
        }

        // 📦 Move processed file to backup folder
        const backupPath = path.join(backupFolder, file);
        fs.renameSync(filePath, backupPath);

      } catch (fileError) {
        console.error(`❌ Error processing file ${file}:`, fileError.message);
      }
    }
  } catch (err) {
    console.error("❌ Error reading incoming folder:", err.message);
  }
};

// Export function
module.exports = processFiles;