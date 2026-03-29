const ExcelJS = require("exceljs");
const { encrypt } = require("../utils/encryption"); 

exports.downloadTemplate = async (req, res) => {
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
};

const multer = require("multer");
const XLSX = require("xlsx");
const { sql } = require("../config/db"); // adjust if needed

const upload = multer({ dest: "uploads/" });

exports.uploadUsers = [
  upload.single("file"),
  async (req, res) => {
    try {
        console.log("FILE 👉", req.file);
      const workbook = XLSX.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      let inserted = 0;
      let skipped = 0;

      for (let user of data) {

        // 🔴 Skip if required fields missing
        if (!user.Emp_id || !user.first_name || !user.Email) {
          skipped++;
          continue;
        }

        // 🔍 Check duplicate
        const existing = await sql.query`
          SELECT * FROM users WHERE Emp_id = ${user.Emp_id}
        `;

        if (existing.recordset.length > 0) {
          skipped++;
          continue;
        }

        let dob;

// Skip if no DOB
if (!user.dob) {
  skipped++;
  continue;
}

// ✅ Case 1: Excel number
if (typeof user.dob === "number") {
  dob = new Date((user.dob - 25569) * 86400 * 1000);
}

// ✅ Case 2: DD.MM.YYYY (your case)
else if (typeof user.dob === "string" && user.dob.includes(".")) {
  const [day, month, year] = user.dob.split(".");
  dob = new Date(`${year}-${month}-${day}`);
}

else if (typeof user.dob === "string" && user.dob.includes("/")) {
  const [day, month, year] = user.dob.split("/");
  dob = new Date(`${year}-${month}-${day}`);
}

// ✅ Case 3: normal string
else {
  dob = new Date(user.dob);
}

// 🔥 Final validation
if (isNaN(dob.getTime())) {
  console.log("❌ Invalid DOB for user:", user);
  skipped++;
  continue;
}

        // ✅ Insert user
        await sql.query`
          INSERT INTO users (Emp_id, first_name, last_name, Email, dob, is_active, car_plate, role)
          VALUES (
            ${user.Emp_id},
            ${user.first_name},
            ${user.last_name || ""},
            ${user.Email},
            ${encrypt(dob.toISOString())},
            1,
            ${user.car_plate || ""},
            ${(user.role || "user").toLowerCase()}
          )
        `;

        inserted++;
      }

      res.json({
        success: true,
        message: "Bulk upload completed",
        inserted,
        skipped
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
];