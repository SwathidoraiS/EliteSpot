const cameraService = require("../services/cameraService");

// ENTRY
const handleEntry = async (req, res, next) => {
  try {
<<<<<<< HEAD
    const result = await cameraService.processEntry(req.body);
    res.json(result);
  } catch (error) {
    next(error);
=======
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

    console.log("📥 JSON saved & processed:", plateNumber);

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
>>>>>>> 701457f (updated)
  }
};

// EXIT
const handleExit = async (req, res, next) => {
  try {
    const result = await cameraService.processExit(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleEntry,
  handleExit
};