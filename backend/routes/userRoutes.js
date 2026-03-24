const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/roleMiddleware");

<<<<<<< HEAD
router.post("/login", userController.login);
=======
// Only logged-in users can view
router.get("/users", authMiddleware, userController.getAllUsers);

// Only admin can create
router.post("/users", authMiddleware, checkRole(["admin"]), userController.addUser);

// Only admin can update
router.put("/users/:id", authMiddleware, checkRole(["admin"]), userController.updateUser);

// Only admin can delete
router.delete("/users/:id", authMiddleware, checkRole(["admin"]), userController.deleteUser);
>>>>>>> 701457f (updated)

module.exports = router;