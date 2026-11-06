const ExcelJS = require("exceljs");
const { sql } = require("../config/db");
const { encrypt } = require("../utils/encryption");
const logger = require("../utils/logger");

/**
 * 📥 Process Excel Upload
 */
exports.processUserUpload = async (filePath) => {

  logger.info("Excel user upload started", {
    filePath
  });

  try {

    // ================= READ EXCEL =================

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      throw new Error("Excel file contains no worksheets");
    }

    logger.info("Excel file read successfully", {
      sheetNames: workbook.worksheets.map(sheet => sheet.name)
    });

    // Read column headers from the first row
    const headerRow = worksheet.getRow(1);

    const headers = headerRow.values
      .slice(1)
      .map(value => String(value ?? "").trim());

    // Convert ExcelJS cell values into regular JavaScript values
    const getCellValue = (value) => {
      if (value === null || value === undefined) {
        return "";
      }

      if (value instanceof Date) {
        return value;
      }

      if (typeof value === "object") {
        if ("result" in value) {
          return value.result ?? "";
        }

        if ("richText" in value) {
          return value.richText
            .map(part => part.text)
            .join("");
        }

        if ("text" in value) {
          return value.text;
        }
      }

      return value;
    };

    // Convert worksheet rows into objects using the headers
    const data = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const record = {};

      headers.forEach((header, index) => {
        if (header) {
          record[header] = getCellValue(
            row.getCell(index + 1).value
          );
        }
      });

      // Skip completely empty rows
      if (
        Object.values(record).some(
          value => value !== "" &&
            value !== null &&
            value !== undefined
        )
      ) {
        data.push(record);
      }
    });

    logger.info("Excel data extracted", {
      totalRows: data.length
    });

    // ================= MAP DATA =================

    const mappedData = data.map(row => ({
      Emp_id: String(
        row["社員ID(Emp id)"] ??
        row["社員番号(Employee ID)"] ??
        row["Emp_id"] ??
        ""
      ).trim(),
      first_name: row["名(First name)"] || "",
      last_name: row["姓(Last name)"] || "",
      Email: row["メールアドレス(Email)"] || "",
      dob: row["生年月日(DOB)"] || "",
      car_plate: row["ナンバープレート(Car plate Number)"] || "",
      role: row["役割(role)"] || "user"
    }));

    logger.info("Excel data mapped successfully", {
      totalMappedRows: mappedData.length
    });

    let inserted = 0;
    let skipped = 0;

    // ================= PROCESS USERS =================

    for (let user of mappedData) {

      logger.info("Processing user row", {
        Emp_id: user.Emp_id
      });

      // ================= REQUIRED FIELDS =================

      if (!user.first_name || !user.Email) {

        logger.warn("User skipped: required fields missing", {
          Emp_id: user.Emp_id
        });

        skipped++;
        continue;
      }

      logger.info("Required fields validated", {
        Emp_id: user.Emp_id
      });

      // ================= DUPLICATE CHECK =================

      if (user.Emp_id && user.Emp_id.trim() !== "") {

        logger.info("Checking duplicate user", {
          Emp_id: user.Emp_id
        });

        const existing = await sql.query`
          SELECT *
          FROM users
          WHERE Emp_id = ${user.Emp_id}
        `;

        if (existing.recordset.length > 0) {

          logger.warn("Duplicate user found - skipping", {
            Emp_id: user.Emp_id
          });

          skipped++;
          continue;
        }

        logger.info("No duplicate found", {
          Emp_id: user.Emp_id
        });
      }

      // ================= DOB =================

      let encryptedDOB = null;

      if (user.dob !== null && user.dob !== undefined && String(user.dob).trim() !== "") {

        let dob;

        // ExcelJS may return a Date object directly
        if (user.dob instanceof Date) {
          dob = user.dob;
        }

        // Excel numeric DOB
        else if (typeof user.dob === "number") {
          logger.info("Processing Excel numeric DOB", {
            Emp_id: user.Emp_id
          });
          dob = new Date((user.dob - 25569) * 86400 * 1000);
        }

        // Excel numeric DOB
        if (typeof user.dob === "number") {

          logger.info("Processing Excel numeric DOB", {
            Emp_id: user.Emp_id
          });

          dob = new Date((user.dob - 25569) * 86400 * 1000);
        }

        // DD.MM.YYYY

        else if (
          typeof user.dob === "string" && user.dob.includes(".")) {

          logger.info("Processing DD.MM.YYYY DOB", {
            Emp_id: user.Emp_id
          });

          const [day, month, year] = user.dob.split(".");
          dob = new Date(`${year}-${month}-${day}`);
        }

        // DD/MM/YYYY

        else if (
          typeof user.dob === "string" && user.dob.includes("/")) {

          logger.info("Processing DD/MM/YYYY DOB", {
            Emp_id: user.Emp_id
          });

          const [day, month, year] = user.dob.split("/");
          dob = new Date(`${year}-${month}-${day}`);
        }

        // Other format

        else {

          logger.info("Processing generic DOB format", {
            Emp_id: user.Emp_id
          });

          dob = new Date(user.dob);
        }


        logger.info("DOB parsed", {
          Emp_id: user.Emp_id,
          valid: !isNaN(dob.getTime())
        });

        // Invalid DOB

        if (isNaN(dob.getTime())) {

          logger.warn("User skipped: invalid DOB", {
            Emp_id: user.Emp_id
          });

          skipped++;
          continue;
        }

        // Encrypt DOB

        encryptedDOB = encrypt(
          dob.toISOString()
        );

        logger.info("DOB encrypted successfully", {
          Emp_id: user.Emp_id
        });
      }

      // ================= INSERT =================

      try {

        logger.info("Inserting user into database", {
          Emp_id: user.Emp_id
        });

        await sql.query`
          INSERT INTO users(Emp_id, first_name, last_name, Email, dob, is_active, car_plate, role)
          VALUES
          (
            ${user.Emp_id?.trim() || null},
            ${user.first_name},
            ${user.last_name || ""},
            ${user.Email},
            ${encryptedDOB},
            1,
            ${user.car_plate || ""},
            ${(user.role || "user").toLowerCase()}
          )
        `;

        inserted++;

        logger.info("User inserted successfully", {
          Emp_id: user.Emp_id
        });

      } catch (err) {

        logger.error("User insert failed", {
          Emp_id: user.Emp_id,
          error: err.message,
          stack: err.stack
        });

        skipped++;
      }
    }

    // ================= FINAL SUMMARY =================

    logger.info("Excel user upload completed", {
      totalRows: mappedData.length,
      inserted,
      skipped
    });


    return {
      inserted,
      skipped
    };

  } catch (err) {

    logger.error("Excel user upload failed", {
      filePath,
      error: err.message,
      stack: err.stack
    });

    throw err;
  }
};
