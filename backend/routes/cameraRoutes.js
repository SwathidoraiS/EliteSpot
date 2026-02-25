const express = require("express");
const router = express.Router();
const cameraController = require("../controllers/cameraController");

// ENTRY
router.post("/entry", cameraController.handleEntry);

// EXIT
router.post("/exit", cameraController.handleExit);

module.exports = router;