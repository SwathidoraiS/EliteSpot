const parkingAreaService = require("../services/parkingAreaService");

/**
 * 🚗 Controller: Get Parking Areas
 * - Fetches all active parking areas
 * - Sends response to client
 */
const getParkingAreas = async (req, res) => {
  try {
    const areas = await parkingAreaService.getParkingAreas();

    return res.json({
      success: true,
      data: areas,
    });

  } catch (err) {
    console.error("Parking Area Error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch parking areas",
    });
  }
};

module.exports = { getParkingAreas };