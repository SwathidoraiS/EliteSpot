const express = require("express");
const router = express.Router();

/**
 * 📊 Dashboard Controller
 * Handles dashboard-related APIs
 */
const { getDashboard } = require("../controllers/dashboardController");

/**
 * 📌 Route: GET /api/dashboard
 */
router.get("/", getDashboard);

/**
 * 📦 Export router
 */
module.exports = router;