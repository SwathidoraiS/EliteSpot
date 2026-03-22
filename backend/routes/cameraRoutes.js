const express = require("express");
const router = express.Router();

const { receiveCameraData } = require("../controllers/cameraController");

// POST /api/camera
router.post("/", receiveCameraData);

module.exports = router;