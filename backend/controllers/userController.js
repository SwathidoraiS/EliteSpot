const userService = require("../services/userService");

// GET
exports.getAllUsers = async (req, res) => {
  const users = await userService.getAllUsers();
  res.json(users);
};

// POST
exports.addUser = async (req, res) => {
  try {

    await userService.addUser(req.body);

    res.json({ message: "User added successfully" });

  } catch (error) {

    console.error("Add user error:", error);

    res.status(400).json({
      message: "Failed to add user",
      error: error.message
    });

  }
};

// PUT
exports.updateUser = async (req, res) => {
  try {
    await userService.updateUser(req.params.id, req.body);
    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(400).json({
      message: "Failed to update user",
      error: error.message
    });
  }
};

// DELETE
exports.deleteUser = async (req, res) => {

  await userService.deleteUser(req.params.id);

  res.json({ message: "User deleted successfully" });

};