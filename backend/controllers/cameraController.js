const cameraService = require("../services/cameraService");

// ENTRY
const handleEntry = async (req, res, next) => {
  try {
    const result = await cameraService.processEntry(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// EXIT
const handleExit = async (req, res, next) => {
  try {
    const result = await cameraService.processExit(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleEntry,
  handleExit
};