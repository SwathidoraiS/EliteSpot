const userService = require("../services/userService");

/**
 * 👤 Controller: Get All Users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    return res.json({
      success: true,
      data: users,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

/**
 * ➕ Controller: Add User
 */
exports.addUser = async (req, res) => {
  try {
    await userService.addUser(req.body);

    return res.json({
      success: true,
      message: "User added successfully",
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to add user",
      error: error.message,
    });
  }
};

/**
 * ✏️ Controller: Update User
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    await userService.updateUser(id, req.body);

    return res.json({
      success: true,
      message: "User updated successfully",
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

/**
 * ❌ Controller: Delete User
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await userService.deleteUser(id);

    return res.json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};