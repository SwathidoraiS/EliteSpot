const sql = require("mssql");

const connectionString =
  "Server=127.0.0.1,1433;Database=Carparking;User Id=parking_user;Password=Parking@123;TrustServerCertificate=True;Encrypt=False";
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