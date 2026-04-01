const ExcelJS = require("exceljs");
const adminService = require("../services/adminService");

/**
 * 📥 Download Template
 */
exports.downloadTemplate = async (req, res, next) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Users");

    sheet.columns = [
      { header: "Emp_id", key: "Emp_id", width: 20 },
      { header: "first_name", key: "first_name", width: 20 },
      { header: "last_name", key: "last_name", width: 20 },
      { header: "Email", key: "Email", width: 30 },
      { header: "dob", key: "dob", width: 15 },
      { header: "car_plate", key: "car_plate", width: 20 },
      { header: "role", key: "role", width: 15 }
    ];

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=user_template.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    next(error);
  }
};

/**
 * 📤 Upload Users
 */
exports.uploadUsers = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const result = await adminService.processUserUpload(req.file.path);

    res.json({
      success: true,
      message: "Bulk upload completed",
      ...result
    });

  } catch (error) {
    console.error(error); // keep for debug
    res.status(500).json({ error: "Upload failed" });
  }
};