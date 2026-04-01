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
    // 1. Save JSON
    const fileName = saveCameraJson(data);

    // 2. Extract plate
    const plateNumber = data["Car number"];

    // 3. Check latest log
    const check = await sql.query(`
      SELECT TOP 1 * FROM parking_logs
      WHERE plate_number = '${plateNumber}'
      ORDER BY timestamp DESC
    `);

    const lastLog = check.recordset[0];
    const isInside = lastLog && lastLog.event_type === 'ENTRY';


    let result = null;


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

    res.json({
      success: result?.success || false,
      message: result?.message || "Unknown error",
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