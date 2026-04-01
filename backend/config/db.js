const sql = require("mssql");
require("dotenv").config();

// Get connection string from environment variables
const connectionString = process.env.DB_CONNECTION_STRING;

/**
 * Establish connection to SQL Server
 */
const connectDB = async () => {
  try {
    // Validate env variable
    if (!connectionString) {
      throw new Error("DB_CONNECTION_STRING is not defined");
    }

    // Connect to database
    await sql.connect(connectionString);

    // Optional: only log in development
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Connected to SQL Server");
    }

  } catch (err) {
    // Always log errors
    console.error("❌ DB CONNECTION FAILED:", err.message);

    // Exit process in production (important)
    process.exit(1);
  }
};

module.exports = { connectDB, sql };