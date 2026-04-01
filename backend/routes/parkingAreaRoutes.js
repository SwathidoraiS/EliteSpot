const express = require("express");
const router = express.Router();

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

/**
 * 📦 Export router
 */
module.exports = router;