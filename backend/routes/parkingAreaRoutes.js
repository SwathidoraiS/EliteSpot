const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/roleMiddleware");
/**
 * 🚗 Parking Area Controller
 * Handles parking area related APIs
 */
const parkingAreaController = require("../controllers/parkingAreaController");

/**
 * 📌 Route: GET /api/parking-areas
 * 
 * Purpose:
 * - Fetch all active parking areas
 */
router.get("/", parkingAreaController.getParkingAreas);
router.put("/areas", verifyToken, checkRole(["admin"]), parkingAreaController.createParkingArea);
router.post("/", verifyToken, checkRole(["admin"]), parkingAreaController.createParkingArea);
/**
 * 📦 Export router
 */
module.exports = router;