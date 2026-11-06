const express = require("express");
const router = express.Router();
const {
 getPendingBusinessTrips,
 approveBusinessTrip,
 rejectBusinessTrip,
 downloadBusinessTripAttachment
} = require("../controllers/businessTripController");
const verifyToken = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/roleMiddleware");
console.log("Bussiness Trip Route Loaded");
router.get("/test", (req, res) => {
 res.json({success: true,message: "Multiple Days route is working"});
});
router.get("/pending", getPendingBusinessTrips);
router.get("/:requestId/attachment",verifyToken,checkRole(["admin","hr"]),downloadBusinessTripAttachment);
router.put("/:requestId/approve",approveBusinessTrip);
router.put("/:requestId/reject",rejectBusinessTrip);

module.exports = router;