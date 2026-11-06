const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const verifyToken = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadBusinessTrip");
router.get("/admin-bookings", verifyToken, checkRole(["admin"]), bookingController.getAllBookings);

router.get("/my", verifyToken, bookingController.getMyBookings);

router.post("/", verifyToken,upload.single("attachment"),bookingController.createBooking);

router.put("/edit/:bookingId", verifyToken, bookingController.editBooking);

router.put("/:bookingId", verifyToken, bookingController.cancelBooking);

module.exports = router;