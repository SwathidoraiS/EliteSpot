const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const verifyToken = require("../middlewares/verifyToken");

router.post("/login", authController.login);
router.get("/me",verifyToken,authController.getMe);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/verify-reset/:token", authController.verifyResetToken);
router.post("/logout", authController.logout);
router.get("/csrf-token",authController.getCsrfToken);
module.exports = router;