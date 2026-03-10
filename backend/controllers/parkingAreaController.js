const parkingAreaService = require("../services/parkingAreaService");

const getParkingAreas = async (req, res) => {

  const areas = await parkingAreaService.getParkingAreas();

  res.json({
    success: true,
    data: areas
  });

};

module.exports = { getParkingAreas };