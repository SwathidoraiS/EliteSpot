const XLSX = require("xlsx");
const { sql } = require("../config/db");
const { encrypt } = require("../utils/encryption");

/**
 * 📥 Process Excel Upload
 */
exports.processUserUpload = async (filePath) => {
  console.log("📂 Starting Excel upload process...");
  console.log("📍 File Path:", filePath);
  
  const workbook = XLSX.readFile(filePath);
  console.log("📑 Sheet Names:", workbook.SheetNames);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  console.log(`📊 Total Rows Found: ${data.length}`);

  let inserted = 0;
  let skipped = 0;

  for (let user of data) {
    // 🔴 Required fields
    if (!user.Emp_id || !user.first_name || !user.Email) {
      console.log("❌ Missing required fields");
      skipped++;
      continue;
    }
    console.log("✅ Required fields present");

    // 🔍 Check duplicate
    console.log(`🔍 Checking duplicate for Emp_id: ${user.Emp_id}`);

    // 🔍 Check duplicate
    const existing = await sql.query`
      SELECT * FROM users WHERE Emp_id = ${user.Emp_id}
    `;

    if (existing.recordset.length > 0) {
      console.log("⚠️ Duplicate user found, skipping...");
      skipped++;
      continue;
    }

    console.log("✅ No duplicate found");

    let dob;

    // ❌ No DOB
    if (!user.dob) {
      console.log("❌ DOB missing");
      skipped++;
      continue;
    }

    console.log("📅 Raw DOB Value:", user.dob);
    console.log("📌 DOB Type:", typeof user.dob);

    // ✅ Excel number
    if (typeof user.dob === "number") {
      console.log("🔄 Converting Excel numeric DOB...");
      dob = new Date((user.dob - 25569) * 86400 * 1000);
    }

    // ✅ DD.MM.YYYY
    else if (typeof user.dob === "string" && user.dob.includes(".")) {
      console.log("🔄 Parsing DD.MM.YYYY format...");
      const [day, month, year] = user.dob.split(".");
      dob = new Date(`${year}-${month}-${day}`);
    }

    // ✅ DD/MM/YYYY
    else if (typeof user.dob === "string" && user.dob.includes("/")) {
      console.log("🔄 Parsing DD/MM/YYYY format...");
      const [day, month, year] = user.dob.split("/");
      dob = new Date(`${year}-${month}-${day}`);
    }

    // ✅ Other
    else {
      console.log("🔄 Parsing generic DOB format...");
      dob = new Date(user.dob);
    }

    console.log("📅 Parsed DOB:", dob);

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