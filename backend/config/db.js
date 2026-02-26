const sql = require("mssql");

const config = {
  user: "YOUR_DB_USERNAME",
  password: "YOUR_DB_PASSWORD",
  server: "localhost", 
  database: "YOUR_DATABASE_NAME",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("✅ Connected to SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("❌ DB Connection Failed:", err);
  });

module.exports = {
  sql,
  poolPromise
};