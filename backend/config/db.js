const sql = require("mssql");
require("dotenv").config();

const connectionString = process.env.DB_CONNECTION_STRING;

const connectDB = async () => {
  try {
    await sql.connect(connectionString);
    console.log("✅ CONNECTED TO SQL SERVER SUCCESSFULLY");

    const result = await sql.query("SELECT GETDATE() AS CurrentTime");
    console.log(result.recordset);

  } catch (err) {
    console.error("❌ DB CONNECTION FAILED:", err);
  }
};

module.exports = { connectDB, sql };