const parkingService = require("../services/parkingService");

const getLayout = async (req, res, next) => {
  try {
    const result = await parkingService.getLayout(req.params.parkingId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getLayout };