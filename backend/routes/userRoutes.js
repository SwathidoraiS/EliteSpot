const express = require("express");
const router = express.Router();

/**
 * 👤 User Controller
 */
const userController = require("../controllers/userController");

/**
 * 🔐 Middlewares
 * - authMiddleware → verifies JWT
 * - checkRole → restricts access by role
 */
const authMiddleware = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/roleMiddleware");

/**
 * 📌 Route: GET /api/users
 * Access: Logged-in users
 * Purpose: Get all users
 */
router.get("/users", authMiddleware, userController.getAllUsers);

/**
 * 📌 Route: POST /api/users
 * Access: Admin only
 * Purpose: Create new user
 */
router.post(
  "/users",
  authMiddleware,
  checkRole(["admin"]),
  userController.addUser
);

/**
 * 📌 Route: PUT /api/users/:id
 * Access: Admin only
 * Purpose: Update user
 */
router.put(
  "/users/:id",
  authMiddleware,
  checkRole(["admin"]),
  userController.updateUser
);

/**
 * 📌 Route: DELETE /api/users/:id
 * Access: Admin only
 * Purpose: Delete user
 */
router.delete(
  "/users/:id",
  authMiddleware,
  checkRole(["admin"]),
  userController.deleteUser
);

/**
 * 📦 Export router
 */
module.exports = router;