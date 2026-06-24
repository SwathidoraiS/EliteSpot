const express = require("express");
const router = express.Router();

const { receiveCameraData } = require("../controllers/cameraController");
const cameraAuth = require("../middlewares/cameraAuth");

router.post("/", cameraAuth, receiveCameraData);

module.exports = router;