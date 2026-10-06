const express = require("express");
const router = express.Router();
const {
 getPendingBusinessTrips,
 approveBusinessTrip,
 rejectBusinessTrip
} = require("../controllers/businessTripController");
console.log("Bussiness Trip Route Loaded");
router.get("/test", (req, res) => {
 res.json({success: true,message: "Business Trip route is working"});
});
router.get("/pending", getPendingBusinessTrips);
router.put("/:requestId/approve",approveBusinessTrip);
router.put("/:requestId/reject",rejectBusinessTrip);
module.exports = router;