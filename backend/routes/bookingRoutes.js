const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.get("/", bookingController.getAllBookings);
router.post("/", bookingController.createBooking);
router.put("/:bookingId", bookingController.cancelBooking);

module.exports = router;