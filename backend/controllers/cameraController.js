const { saveCameraJson, saveParkingLog, handleCarEntry } = require("../services/cameraService");

const receiveCameraData = async (req, res) => {
  try {
    const data = req.body;

    console.log("Incoming data:", data);

    // 1. Save JSON file
    const fileName = saveCameraJson(data);

    // 2. Extract plate number
    const plateNumber = data["Car number"];
    console.log("Plate:", plateNumber);

    // 3. Save ENTRY log

    // 4. Handle booking + dashboard
    const result = await handleCarEntry(plateNumber);

    if (result) {
      await saveParkingLog(plateNumber);
    }

    console.log("📥 JSON saved & processed:", plateNumber);

    res.json({
      success: true,
      message: result ? "Car entry processed" : "No booking / user not found",
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