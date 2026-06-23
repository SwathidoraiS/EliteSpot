const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

/**
 * 📥 Download Template
 */
router.get("/download-template", adminController.downloadTemplate);

/**
 * 📤 Upload Users
 */
router.post("/upload-users",upload.single("file"),adminController.uploadUsers);

module.exports = router;