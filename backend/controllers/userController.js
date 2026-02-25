const userService = require("../services/userService");

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { login };