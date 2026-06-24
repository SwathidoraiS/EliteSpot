const { sql } = require("../config/db");

const {
  saveCameraJson,
  saveParkingLog,
  handleCarEntry,
  handleCarExit
} = require("../services/cameraService");

const receiveCameraData = async (req, res) => {
  try {

    console.log("============== WEBHOOK RECEIVED ==============");
    console.log(JSON.stringify(req.body, null, 2));

    const data = req.body;
    // 1. Save JSON
    const fileName = saveCameraJson(data);

    // 2. Extract plate
    let plateNumber = "";

if (
  data.PLATES &&
  Array.isArray(data.PLATES) &&
  data.PLATES.length > 0
) {
  const plate = data.PLATES[0];

  plateNumber = [
    plate.AREA,
    plate.CLASS,
    plate.KANA,
    plate.DIGITS
  ]
    .filter(Boolean)
    .join("");
}

if (!plateNumber) {
  return res.status(400).json({
    success: false,
    message: "Plate number not found in webhook payload"
  });
}

console.log("Detected Plate:", plateNumber);

console.log("Plate:", plateNumber);

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