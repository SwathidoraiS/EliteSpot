const parkingService = require("../services/parkingService");

const getLayout = async (req, res, next) => {
  try {

    const parkingId = req.params.parkingId;
    const { startTime, endTime } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Start time and end time are required"
      });
    }

    const result = await parkingService.getLayout(
      parkingId,
      startTime,
      endTime
    );

    res.json({ success: true, data: result });

  } catch (error) {
    next(error);
  }
};

module.exports = { getLayout };