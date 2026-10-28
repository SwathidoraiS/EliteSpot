const express = require("express");
const router = express.Router();

/**
 * 🅿️ Parking Controller
 * Handles parking layout-related APIs
 */
const parkingController = require("../controllers/parkingController");
const verifyToken = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/roleMiddleware");
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
// Admin-only: Save parking layout positions
router.put("/:parkingId/layout",verifyToken,checkRole(["admin"]),parkingController.saveLayout);

// Admin-only: Save parking canvas dimensions
router.patch("/:parkingId/layout-dimensions", verifyToken, checkRole(["admin"]), parkingController.saveLayoutDimensions);

router.post("/:parkingId/slots/generate", verifyToken, checkRole(["admin"]), parkingController.generateSlots);

router.delete("/:parkingId/slots/:slotId",verifyToken,checkRole(["admin"]),parkingController.deleteSlot);

router.post("/:parkingId/slots/:slotId/copy", verifyToken, checkRole(["admin"]),parkingController.copySlot);

router.patch("/:parkingId/slots/:slotId/restore", verifyToken,checkRole(["admin"]), parkingController.restoreSlot);

router.patch("/:parkingId/slots/:slotId/number",verifyToken,checkRole(["admin"]),parkingController.updateSlotNumber);

router.patch("/:parkingId/slots/:slotId/fixed-status",verifyToken,checkRole(["admin"]),parkingController.updateSlotFixedStatus);
/**
 * 📦 Export router
 */
module.exports = router;