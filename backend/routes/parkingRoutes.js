const express = require("express");
const router = express.Router();
const parkingController = require("../controllers/parkingController");

router.get("/:parkingId/layout", parkingController.getLayout);

module.exports = router;