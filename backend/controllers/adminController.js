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
      { header: "社員ID(Emp id)", key: "Emp_id", width: 20 },
      { header: "名(First name)", key: "first_name", width: 20 },
      { header: "姓(Last name)", key: "last_name", width: 20 },
      { header: "メールアドレス(Email)", key: "Email", width: 25 },
      { header: "生年月日(DOB)", key: "dob", width: 20 },
      { header: "ナンバープレート(Car plate Number)", key: "car_plate", width: 35 },
      { header: "役割(role)", key: "role", width: 20 }
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