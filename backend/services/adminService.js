const XLSX = require("xlsx");
const { sql } = require("../config/db");
const { encrypt } = require("../utils/encryption");

/**
 * 📥 Process Excel Upload
 */
exports.processUserUpload = async (filePath) => {
  
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  let inserted = 0;
  let skipped = 0;

  for (let user of data) {
    // 🔴 Required fields
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

    // ❌ No DOB
    if (!user.dob) {
      skipped++;
      continue;
    }

    // ✅ Excel number
    if (typeof user.dob === "number") {
      dob = new Date((user.dob - 25569) * 86400 * 1000);
    }

    // ✅ DD.MM.YYYY
    else if (typeof user.dob === "string" && user.dob.includes(".")) {
      const [day, month, year] = user.dob.split(".");
      dob = new Date(`${year}-${month}-${day}`);
    }

    // ✅ DD/MM/YYYY
    else if (typeof user.dob === "string" && user.dob.includes("/")) {
      const [day, month, year] = user.dob.split("/");
      dob = new Date(`${year}-${month}-${day}`);
    }

    // ✅ Other
    else {
      dob = new Date(user.dob);
    }

    // ❌ Invalid DOB
    if (isNaN(dob.getTime())) {
      skipped++;
      continue;
    }

    // ✅ Insert
    await sql.query`
      INSERT INTO users 
      (Emp_id, first_name, last_name, Email, dob, is_active, car_plate, role)
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

  return { inserted, skipped };
};