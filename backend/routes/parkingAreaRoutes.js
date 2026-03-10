const express = require("express");
const router = express.Router();

const parkingAreaController = require("../controllers/parkingAreaController");

router.get("/", parkingAreaController.getParkingAreas);

module.exports = router;