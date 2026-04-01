const parkingService = require("../services/parkingService");

/**
 * 🅿️ Controller: Get Parking Layout
 * - Validates input
 * - Calls service
 * - Sends response
 */
const getLayout = async (req, res, next) => {
  try {
    const { parkingId } = req.params;
    const { startTime, endTime } = req.query;

    // ❌ Validate required query params
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Start time and end time are required",
      });
    }

    // 🔍 Fetch layout from service
    const result = await parkingService.getLayout(
      parkingId,
      startTime,
      endTime
    );

    return res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    // 🚨 Pass error to global error handler
    next(error);
  }
};

module.exports = { getLayout };