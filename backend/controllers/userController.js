const userService = require("../services/userService");

// GET
exports.getAllUsers = async (req, res) => {
  const users = await userService.getAllUsers();
  res.json(users);
};

// POST
exports.addUser = async (req, res) => {
  await userService.addUser(req.body);
  res.json({ message: "User added successfully" });
};

// PUT
exports.updateUser = async (req, res) => {
  await userService.updateUser(req.params.id, req.body);
  res.json({ message: "User updated successfully" });
};

// DELETE
exports.deleteUser = async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.json({ message: "User deleted successfully" });
};