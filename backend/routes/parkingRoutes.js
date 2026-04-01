const express = require("express");
const router = express.Router();

/**
 * 🅿️ Parking Controller
 * Handles parking layout-related APIs
 */
const parkingController = require("../controllers/parkingController");

/**
 * 📌 Route: GET /api/parking/:parkingId/layout
 *
 * Params:
 * - parkingId → ID of the parking area
 *
 * Query:
 * - startTime (YYYY-MM-DD HH:mm)
 * - endTime   (YYYY-MM-DD HH:mm)
 *
 * Purpose:
 * - Returns slot layout with status:
 *   available / reserved / parked
 */
router.get("/:parkingId/layout", parkingController.getLayout);

/**
 * 📦 Export router
 */
module.exports = router;