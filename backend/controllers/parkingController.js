const parkingService = require("../services/parkingService");

/**
 * 🅿️ Controller: Get Parking Layout
 * - Validates input
 * - Calls service
 * - Sends response
 */
const getLayout = async (req, res, next) => {
  try {
    const { parkingId } = req.params;
    const { startTime, endTime } = req.query;

    // ❌ Validate required query params
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Start time and end time are required",
      });
    }

    // 🔍 Fetch layout from service
    const result = await parkingService.getLayout(
      parkingId,
      startTime,
      endTime
    );

    return res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    // 🚨 Pass error to global error handler
    next(error);
  }
};

const saveLayout = async (req, res, next) => {
  try {
    const { parkingId } = req.params;
    const { slots } = req.body;

    if (!Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        message: "Slots must be an array",
      });
    }

    const result = await parkingService.saveLayout(
      parkingId,
      slots
    );

    return res.json({
      success: true,
      message: "Parking layout saved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const saveLayoutDimensions = async (req, res, next) => {
  try {
    const { parkingId } = req.params;
    const { width, height } = req.body;

    const result = await parkingService.saveLayoutDimensions(
      parkingId,
      width,
      height
    );

    return res.json({
      success: true,
      message: "Parking canvas dimensions saved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const generateSlots = async (req, res, next) => {
  try {
    const { parkingId } = req.params;
    const { prefix, count } = req.body;

    const result = await parkingService.generateSlots(
      parkingId,
      prefix,
      count
    );

    return res.status(201).json({
      success: true,
      message: "Parking slots generated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSlot = async (req, res) => {
  try {
    const { parkingId, slotId } = req.params;

    await parkingService.deleteSlot(parkingId, slotId);

    return res.status(200).json({
      success: true,
      message: "Parking slot deleted successfully",
    });
  } catch (error) {
    console.error("Delete slot error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete parking slot",
    });
  }
};

const copySlot = async (req, res) => {
  try {
    const { parkingId, slotId } = req.params;

    const copiedSlot = await parkingService.copySlot(
      parkingId,
      slotId
    );

    return res.status(201).json({
      success: true,
      message: "Parking slot copied successfully",
      data: copiedSlot,
    });
  } catch (error) {
    console.error("Copy slot error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to copy parking slot",
    });
  }
};

const restoreSlot = async (req, res) => {
  try {
    const { parkingId, slotId } = req.params;

    const restoredSlot = await parkingService.restoreSlot(
      parkingId,
      slotId
    );

    return res.status(200).json({
      success: true,
      message: "Parking slot restored successfully",
      data: restoredSlot,
    });
  } catch (error) {
    console.error("Restore slot error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to restore parking slot",
    });
  }
};

const updateSlotNumber = async (req, res) => {
  try {
    const { parkingId, slotId } = req.params;
    const { slotNumber } = req.body;

    const updatedSlot = await parkingService.updateSlotNumber(
      parkingId,
      slotId,
      slotNumber
    );

    return res.status(200).json({
      success: true,
      message: "Slot number updated successfully",
      data: updatedSlot,
    });
  } catch (error) {
    console.error("Update slot number error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update slot number",
    });
  }
};

const updateSlotFixedStatus = async (req, res) => {
  try {
    const { parkingId, slotId } = req.params;
    const { isFixed } = req.body;

    const updatedSlot = await parkingService.updateSlotFixedStatus(
      parkingId,
      slotId,
      isFixed
    );

    return res.status(200).json({
      success: true,
      message: "Slot type updated successfully",
      data: updatedSlot,
    });
  } catch (error) {
    console.error("Update slot type error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update slot type",
    });
  }
};

module.exports = { getLayout, saveLayout, saveLayoutDimensions, generateSlots, deleteSlot, copySlot, restoreSlot, updateSlotNumber, updateSlotFixedStatus };