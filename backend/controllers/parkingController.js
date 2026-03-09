const parkingService = require("../services/parkingService");

const getLayout = async (req, res, next) => {
  try {

    const parkingId = req.params.parkingId;
    const { date, time } = req.query;

    // Debug log
    console.log("ParkingId:", parkingId);
    console.log("Date:", date);
    console.log("Time:", time);

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "Date and time are required"
      });
    }

    const result = await parkingService.getLayout(parkingId, date, time);

    res.json({ success: true, data: result });

  } catch (error) {
    next(error);
  }
};

module.exports = { getLayout };