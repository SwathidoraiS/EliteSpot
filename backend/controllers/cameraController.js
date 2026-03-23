const { sql } = require("../config/db");

const {
  saveCameraJson,
  saveParkingLog,
  handleCarEntry,
  handleCarExit
} = require("../services/cameraService");

const receiveCameraData = async (req, res) => {
  try {
    const data = req.body;

    console.log("Incoming data:", data);

    // 1. Save JSON
    const fileName = saveCameraJson(data);

    // 2. Extract plate
    const plateNumber = data["Car number"];
    console.log("Plate:", plateNumber);

    // 3. Check latest log
    const check = await sql.query(`
      SELECT TOP 1 * FROM parking_logs
      WHERE plate_number = '${plateNumber}'
      ORDER BY timestamp DESC
    `);

    const lastLog = check.recordset[0];
    const isInside = lastLog && lastLog.event_type === 'ENTRY';

    let result = false;

    if (isInside) {
      // 🚪 EXIT FLOW
      result = await handleCarExit(plateNumber);

      if (result) {
        await sql.query(`
          INSERT INTO parking_logs (plate_number, event_type)
          VALUES ('${plateNumber}', 'EXIT')
        `);
      }

    } else {
      // 🚗 ENTRY FLOW
      result = await handleCarEntry(plateNumber);

      if (result) {
        await saveParkingLog(plateNumber);
      }
    }

    console.log("📥 JSON saved & processed:", plateNumber);

    res.json({
      success: true,
      message: result
        ? (isInside ? "Car exit processed" : "Car entry processed")
        : "No booking / user not found",
      file: fileName
    });

  } catch (err) {
    console.error("❌ Error:", err.message);

    res.status(500).json({
      success: false,
      message: "Error processing data"
    });
  }
};

module.exports = { receiveCameraData };